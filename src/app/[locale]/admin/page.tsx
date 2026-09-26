import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ params: { locale } }: { params: { locale: string } }) {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    redirect(`/${locale}/login`);
  }

  let user;
  try {
    user = JSON.parse(authToken);
  } catch (err) {
    redirect(`/${locale}/login`);
  }

  const ADMIN_EMAILS = ['abderelmalki@gmail.com', 'contact@woosenteur.fr', 'baba@woosenteur.fr'];

  if (!ADMIN_EMAILS.includes(user.email)) {
    return (
      <div className="min-h-screen bg-iron-950 text-smoke-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display font-bold text-ember-500">Accès Refusé</h1>
            <p className="text-smoke-500">Cette page est strictement réservée aux administrateurs de LinkdnForge.</p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch users
  let users: any[] = [];
  try {
    if (adminDb) {
      const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
      users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }

  // Calculate some stats
  const totalUsers = users.length;
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const starterUsers = users.filter(u => u.plan === 'starter').length;
  const activeSubs = users.filter(u => u.subscriptionStatus === 'active').length;

  return (
    <div className="min-h-screen bg-iron-950 text-smoke-100 flex flex-col">
      <header className="border-b border-iron-800 bg-iron-900/50 p-6 flex justify-between items-center">
        <h1 className="font-display font-bold text-2xl text-ember-500">LinkdnForge Admin</h1>
        <div className="text-sm text-smoke-500">Connecté en tant que {user.email}</div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-iron-900/40 border border-iron-800 rounded-xl p-6">
            <p className="text-smoke-500 text-sm font-mono uppercase tracking-widest mb-2">Utilisateurs</p>
            <p className="text-4xl font-display font-bold text-smoke-100">{totalUsers}</p>
          </div>
          <div className="bg-iron-900/40 border border-ember-500/30 rounded-xl p-6">
            <p className="text-ember-500 text-sm font-mono uppercase tracking-widest mb-2">Abonnés Actifs</p>
            <p className="text-4xl font-display font-bold text-smoke-100">{activeSubs}</p>
          </div>
          <div className="bg-iron-900/40 border border-iron-800 rounded-xl p-6">
            <p className="text-smoke-500 text-sm font-mono uppercase tracking-widest mb-2">Plan Pro</p>
            <p className="text-4xl font-display font-bold text-smoke-100">{proUsers}</p>
          </div>
          <div className="bg-iron-900/40 border border-iron-800 rounded-xl p-6">
            <p className="text-smoke-500 text-sm font-mono uppercase tracking-widest mb-2">Plan Starter</p>
            <p className="text-4xl font-display font-bold text-smoke-100">{starterUsers}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-iron-900/30 border border-iron-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-iron-800 bg-iron-900/50">
            <h2 className="font-display font-bold text-xl">Derniers Inscrits</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-iron-900/30 text-smoke-500 font-mono text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium">Inscription</th>
                  <th className="px-6 py-4 font-medium">Stripe ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-iron-800/20 transition">
                    <td className="px-6 py-4 text-smoke-100 font-medium">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider
                        ${u.plan === 'pro' ? 'bg-ember-500/20 text-ember-400 border border-ember-500/30' : 
                          u.plan === 'starter' ? 'bg-quench-500/20 text-quench-400 border border-quench-500/30' : 
                          'bg-iron-800 text-smoke-300'}`}
                      >
                        {u.plan || 'Gratuit'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.subscriptionStatus === 'active' ? (
                        <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded">Actif</span>
                      ) : u.subscriptionStatus === 'canceled' ? (
                        <span className="text-rose-400 text-xs font-mono uppercase tracking-widest bg-rose-400/10 px-2 py-1 rounded">Annulé</span>
                      ) : (
                        <span className="text-smoke-500 text-xs font-mono uppercase tracking-widest">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-smoke-400">
                      {u.createdAt ? new Date(u.createdAt._seconds ? u.createdAt._seconds * 1000 : u.createdAt).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-smoke-500">
                      {u.stripeCustomerId ? (
                        <a href={`https://dashboard.stripe.com/customers/${u.stripeCustomerId}`} target="_blank" rel="noreferrer" className="hover:text-ember-400 transition">
                          {u.stripeCustomerId.substring(0, 12)}...
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-smoke-500">
                      Aucun utilisateur trouvé dans la base de données.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
