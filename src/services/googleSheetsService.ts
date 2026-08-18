import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { RegistroBuscaAtiva } from '../types';

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de autorização do Google.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro no login Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  totalRegistros: number;
}

export const exportarParaGooglePlanilhas = async (
  registros: RegistroBuscaAtiva[],
  tokenOpcional?: string
): Promise<ExportResult> => {
  let token = tokenOpcional || cachedAccessToken;
  
  if (!token) {
    const authResult = await signInWithGoogle();
    token = authResult.accessToken;
  }

  const agora = new Date();
  const dataHoraFormatada = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  const title = `Busca Ativa - CEMEI Maria de Lourdes (${dataHoraFormatada})`;

  // 1. Criar a planilha via Google Sheets API
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
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

  if (!createResponse.ok) {
    const errJson = await createResponse.json().catch(() => ({}));
    throw new Error(errJson.error?.message || 'Falha ao criar planilha no Google Drive/Docs.');
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
    throw new Error(errJson.error?.message || 'Falha ao salvar linhas na planilha do Google.');
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
  };
};
