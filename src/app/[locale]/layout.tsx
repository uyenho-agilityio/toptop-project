import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '@/themes/globals.css';

export const metadata: Metadata = {
  title: 'TopTop',
};

export const generateStaticParams = () =>
  routing.locales.map(locale => ({ locale }));

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
