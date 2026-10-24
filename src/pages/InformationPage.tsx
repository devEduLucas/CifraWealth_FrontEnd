import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo/Logo';
import { Footer } from '../components/Footer/Footer';
import { session } from '../lib/session';

const CONTENT = {
  terms: {
    title: 'Termos de uso',
    intro: 'Conheça o funcionamento e as condições de uso da CifraWealth.',
    sections: [
      ['Organização financeira', 'A plataforma permite registrar receitas e despesas, organizar categorias, acompanhar metas e consultar relatórios. Os valores e as datas são informados pelo usuário.'],
      ['Metas e valores guardados', 'Registrar um valor guardado acompanha uma reserva que você já fez. Essa ação não realiza transferências bancárias nem movimenta sua conta ou investimentos.'],
      ['Acesso à conta', 'Use um e-mail ao qual você tenha acesso, mantenha sua senha em sigilo e confira os registros feitos em sua conta. A confirmação e a recuperação de acesso dependem de links temporários enviados por e-mail.'],
      ['Demonstração', 'Quando o modo demonstração estiver habilitado, um aviso identifica os dados fictícios. Os registros desse modo ficam no navegador e não são transferidos para uma conta real.'],
      ['Dúvidas sobre o serviço', 'Procure a equipe responsável por disponibilizar esta aplicação para esclarecer questões sobre sua conta ou sobre estas informações.'],
    ],
  },
  privacy: {
    title: 'Privacidade',
    intro: 'Estas informações descrevem os dados utilizados pelas funcionalidades atuais da plataforma.',
    sections: [
      ['Dados da conta e registros', 'A aplicação utiliza nome, e-mail e informações de acesso para identificar sua conta. Categorias, transações e metas que você informa são armazenadas no servidor e associadas ao seu usuário. Se você adicionar foto ou capa ao perfil, as imagens ajustadas também serão armazenadas com a conta.'],
      ['Senha e sessões', 'A senha é armazenada como hash. O navegador guarda o token de sessão necessário para acessar a API, além das preferências de aparência e do menu. Ao sair, os dados da sessão são removidos deste navegador.'],
      ['Serviços de autenticação e e-mail', 'Quando habilitado, o login Google utiliza os dados de identificação fornecidos por essa integração. O envio de confirmação e recuperação de senha utiliza a Brevo, que recebe o destinatário e o conteúdo da mensagem.'],
      ['Proteção durante o acesso', 'A API verifica a autenticação e restringe os registros à conta correspondente. Em ambientes publicados com HTTPS, os dados também são protegidos durante o transporte. Isso não equivale a criptografia de ponta a ponta dos registros financeiros.'],
      ['Controle do perfil', 'No Perfil, você pode alterar o nome, a foto e a capa. O e-mail de acesso não é alterado por essa tela. A opção Excluir minha conta remove a conta e seus registros financeiros após confirmar sua senha ou, em contas que usam apenas Google, confirmar novamente sua identidade pelo Google.'],
      ['Dúvidas sobre seus dados', 'Para outras solicitações sobre os dados da sua conta, entre em contato com a equipe responsável por disponibilizar esta aplicação.'],
    ],
  },
};

export function InformationPage({ kind }: { kind: keyof typeof CONTENT }) {
  const content = CONTENT[kind];
  const home = session.isAuthenticated() ? '/home' : '/';
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-foreground">
      <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4 sm:px-6">
        <Link to={home} aria-label="CifraWealth — início"><Logo /></Link>
        <Link to={home} className="rounded-lg px-3 py-2 text-sm font-semibold text-accent-ink hover:bg-elevated">Voltar ao início</Link>
      </header>
      <main id="conteudo-principal" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">{content.title}</h1>
        <p className="mt-3 text-muted">{content.intro}</p>
        <div className="mt-8 space-y-6">
          {content.sections.map(([title, text]) => <section key={title} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-secondary">{text}</p>
          </section>)}
        </div>
      </main>
      <Footer />
    </div>
  );
}
