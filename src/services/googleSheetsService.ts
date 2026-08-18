import firebaseConfig from '../../firebase-applet-config.json';
import { RegistroBuscaAtiva } from '../types';

export interface GoogleUserProfile {
  email: string;
  name?: string;
  picture?: string;
}

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  totalRegistros: number;
  userEmail?: string | null;
}

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

let cachedToken: string | null = null;
let cachedUserProfile: GoogleUserProfile | null = null;
const authListeners: Array<(user: GoogleUserProfile | null) => void> = [];

// Carregar script do Google Identity Services de forma assíncrona garantida
export const ensureGsiLoaded = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Falha ao carregar script do Google.')));
      // Timeout fallback se já carregou antes do event listener
      setTimeout(() => {
        if (window.google?.accounts?.oauth2) resolve();
      }, 500);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar script do Google Identity Services.'));
    document.head.appendChild(script);
  });
};

export const initGoogleAuth = (callback: (user: GoogleUserProfile | null) => void) => {
  authListeners.push(callback);
  callback(cachedUserProfile);
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) authListeners.splice(index, 1);
  };
};

const notifyAuthListeners = () => {
  authListeners.forEach(cb => cb(cachedUserProfile));
};

// Obter perfil do usuário via Google UserInfo API
async function fetchUserProfile(token: string): Promise<GoogleUserProfile | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        email: data.email,
        name: data.name,
        picture: data.picture
      };
    }
  } catch (e) {
    console.warn('Não foi possível obter dados do perfil do Google:', e);
  }
  return null;
}

// Obter Access Token usando Google Identity Services Token Client
export const requestGoogleToken = (promptType: 'select_account' | 'consent select_account' = 'select_account'): Promise<{ token: string; profile: GoogleUserProfile | null }> => {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureGsiLoaded();

      const clientId = firebaseConfig.oAuthClientId;
      if (!clientId) {
        throw new Error('ID do cliente OAuth do Google não configurado.');
      }

      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services não está disponível no momento.');
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        prompt: promptType,
        callback: async (response: any) => {
          if (response.error) {
            console.error('Erro retornado pelo Google OAuth:', response);
            if (response.error === 'access_denied') {
              reject(new Error('Acesso cancelado ou não autorizado pelo usuário.'));
            } else {
              reject(new Error(response.error_description || response.error || 'Erro na autenticação com o Google.'));
            }
            return;
          }

          if (!response.access_token) {
            reject(new Error('Nenhum token de acesso retornado pelo Google.'));
            return;
          }

          cachedToken = response.access_token;
          const profile = await fetchUserProfile(cachedToken);
          cachedUserProfile = profile;
          notifyAuthListeners();

          resolve({ token: cachedToken, profile });
        },
        error_callback: (err: any) => {
          console.error('Erro no cliente Google OAuth:', err);
          reject(new Error(err?.message || 'Falha ao abrir diálogo de autorização do Google.'));
        }
      });

      client.requestAccessToken({ prompt: promptType });
    } catch (err: any) {
      reject(err);
    }
  });
};

export const selectGoogleAccount = async () => {
  cachedToken = null;
  cachedUserProfile = null;
  notifyAuthListeners();
  return requestGoogleToken('consent select_account');
};

export const logoutGoogle = async () => {
  if (cachedToken && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(cachedToken, () => {});
    } catch (e) {
      console.warn('Erro ao revogar token:', e);
    }
  }
  cachedToken = null;
  cachedUserProfile = null;
  notifyAuthListeners();
};

export const getCurrentUserProfile = (): GoogleUserProfile | null => {
  return cachedUserProfile;
};

export const exportarParaGooglePlanilhas = async (
  registros: RegistroBuscaAtiva[]
): Promise<ExportResult> => {
  let token = cachedToken;
  let profile = cachedUserProfile;

  // Se não temos token ou se expirou, solicita autorização
  if (!token) {
    const authData = await requestGoogleToken('select_account');
    token = authData.token;
    profile = authData.profile;
  }

  const agora = new Date();
  const dataHoraFormatada = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  const title = `Busca Ativa - CEMEI Maria de Lourdes (${dataHoraFormatada})`;

  // 1. Criar a planilha via Google Sheets API
  let createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Busca Ativa CEMEI',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  // Se o token expirou ou faltou permissão (401/403), solicita novo token com consentimento
  if (!createResponse.ok && (createResponse.status === 401 || createResponse.status === 403)) {
    console.warn('Token expirado ou sem escopo suficiente. Solicitando nova autorização...');
    const authData = await requestGoogleToken('consent select_account');
    token = authData.token;
    profile = authData.profile;

    createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Busca Ativa CEMEI',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    });
  }

  if (!createResponse.ok) {
    const errJson = await createResponse.json().catch(() => ({}));
    const rawError = errJson.error?.message || '';
    if (createResponse.status === 403 || rawError.includes('insufficient') || rawError.includes('permission')) {
      cachedToken = null;
      throw new Error(
        'Permissão não concedida. Ao abrir a tela do Google, marque a caixa autorizando o acesso ao Google Drive / Google Planilhas.'
      );
    }
    throw new Error(rawError || 'Não foi possível criar a planilha no Google Drive. Verifique suas permissões.');
  }

  const sheetData = await createResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Montar dados
  const headers = [
    'ID',
    'Data de Registro',
    'Nome do Aluno',
    'Turma',
    'Total de Faltas',
    'Dias de Atestado',
    'Perda de Carga Horária',
    'Infrequência Não Justificada',
    'Descrição da Ocorrência',
    'Retorno da Busca Ativa',
    'Portaria SEMED Aplicável',
    'Status',
    'Registrado Por',
    'Data Retorno Efetivo'
  ];

  const formatarData = (dataStr: string) => {
    if (!dataStr) return '';
    try {
      const [ano, mes, dia] = dataStr.split('-');
      if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
      return dataStr;
    } catch {
      return dataStr;
    }
  };

  const rows = registros.map((r) => {
    const faltas = r.totalFaltas || 0;
    const atestado = r.totalDiasAtestado || 0;
    const perda = r.totalDiasPerdaCargaHoraria || 0;
    const hasAny = r.totalFaltas !== undefined || r.totalDiasAtestado !== undefined || r.totalDiasPerdaCargaHoraria !== undefined;
    const infrequenciaNaoJustificada = hasAny ? Math.max(0, faltas - atestado - perda) : '';

    return [
      r.id,
      formatarData(r.data),
      r.nomeAluno,
      r.turma,
      r.totalFaltas !== undefined ? r.totalFaltas : '',
      r.totalDiasAtestado !== undefined ? r.totalDiasAtestado : '',
      r.totalDiasPerdaCargaHoraria !== undefined ? r.totalDiasPerdaCargaHoraria : '',
      infrequenciaNaoJustificada,
      r.descricao || '',
      r.retornoBuscaAtiva || '',
      r.descricaoPortariaSemed || '',
      r.status || '',
      r.registradoPor || '',
      r.dataRetornoEfetivo ? formatarData(r.dataRetornoEfetivo) : ''
    ];
  });

  const values = [headers, ...rows];

  // 3. Preencher valores
  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Busca%20Ativa%20CEMEI!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Busca Ativa CEMEI!A1',
        majorDimension: 'ROWS',
        values,
      }),
    }
  );

  if (!updateResponse.ok) {
    const errJson = await updateResponse.json().catch(() => ({}));
    throw new Error(errJson.error?.message || 'Falha ao preencher linhas na planilha do Google.');
  }

  // 4. Formatação visual do cabeçalho
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.12, green: 0.28, blue: 0.55 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: headers.length,
              },
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Erro não-crítico ao estilizar cabeçalho da planilha:', err);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    totalRegistros: registros.length,
    userEmail: profile?.email,
  };
};

// Declaração dos tipos do Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke?: (token: string, done: () => void) => void;
        };
      };
    };
  }
}
