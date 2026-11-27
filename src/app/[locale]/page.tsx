import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';

const HomePage = ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('Home');

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-2 p-6">
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <p className="opacity-70">{t('description')}</p>
    </main>
  );
};

export default HomePage;
