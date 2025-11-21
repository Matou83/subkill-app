# SubKill MVP

**Application de gestion d'abonnements avec assistant de résiliation**

SubKill est une application Next.js 14 permettant de gérer vos abonnements actifs, de suivre les coûts mensuels et de faciliter la résiliation de services.

## 🚀 Démo en ligne

👉 [https://subkill-app.vercel.app/](https://subkill-app.vercel.app/)

## 📋 Stack technique

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Base de données**: Supabase (PostgreSQL)
- **Déploiement**: Vercel

## 🛠️ Installation locale

### Prérequis

- Node.js 20+ installé
- Un compte Supabase (gratuit)
- Git

### Étapes d'installation

1. **Cloner le repository**

```bash
git clone https://github.com/Matou83/subkill-app.git
cd subkill-app
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer Supabase**

Le projet utilise déjà une base de données Supabase configurée. Pour utiliser votre propre instance:

- Créez un projet sur [supabase.com](https://supabase.com)
- Créez la table `subscriptions` avec le script SQL fourni dans `/docs/schema.sql`
- Activez Row Level Security (RLS)

4. **Configurer les variables d'environnement**

Copiez le fichier `.env.example` en `.env.local`:

```bash
cp .env.example .env.local
```

Puis éditez `.env.local` avec vos credentials Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_publique
```

5. **Lancer le serveur de développement**

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
subkill-app/
├── app/              # Pages et routes Next.js 14 (App Router)
├── lib/              # Utilitaires (client Supabase, helpers)
├── .env.example      # Template des variables d'environnement
├── package.json      # Dépendances et scripts
└── README.md         # Ce fichier
```

## 🔑 Fonctionnalités

- ✅ Dashboard des abonnements actifs
- ✅ Calcul du coût mensuel total
- ✅ Alertes de renouvellement (badges colorés)
- ✅ Assistant de résiliation
- ✅ Génération de lettres LRAR pour résiliation par courrier
- ✅ Base de données PostgreSQL via Supabase
- ✅ Déploiement automatique sur Vercel

## 🗄️ Schéma de base de données

Table `subscriptions`:

- `id`: UUID (primary key)
- `service_name`: string
- `monthly_cost`: number
- `renewal_date`: date
- `status`: 'active' | 'cancelled'
- `icon`: string (emoji ou URL)
- `user_id`: string (nullable)
- `created_at`: timestamp
- `updated_at`: timestamp

## 🚢 Déploiement

### Sur Vercel

1. Connectez votre repository GitHub à Vercel
2. Ajoutez les variables d'environnement dans les paramètres Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Déployez!

## 📝 Scripts disponibles

```bash
npm run dev       # Démarre le serveur de développement
npm run build     # Compile l'application pour la production
npm start         # Démarre le serveur de production
npm run lint      # Vérifie le code avec ESLint
```

## 🎨 Design

- Couleur principale: Bleu #2563EB (CTA)
- Couleur d'alerte: Rouge #DC2626
- Inspiration: Stripe (clarté) + Linear (efficacité)

## 📄 Licence

MIT

## 👤 Auteur

**Mathieu Ingrao**  
Product Manager | QA Specialist

---

💡 **Note**: Ce projet est un MVP (Minimum Viable Product) développé pour démontrer la faisabilité d'une plateforme de gestion d'abonnements avec assistant de résiliation.
