import { useTranslations } from 'next-intl';
import { cn } from '@/utils';

type DataValueProps<T extends number | string> = {
  /** `null` or `undefined` means the data is missing. A real 0 is a value. */
  value: T | null | undefined;
  /** Why the value would be missing: not entered by a person, or not synced from a platform. */
  missingReason: 'notEntered' | 'notSynced';
  /** Formats a present value. Never called for a missing value. */
  format?: (value: T) => string;
  className?: string;
};

export const DataValue = <T extends number | string>({
  value,
  missingReason,
  format,
  className,
}: DataValueProps<T>) => {
  const t = useTranslations('DataValue');

  if (value === null || value === undefined) {
    return (
      <span
        title={t(missingReason)}
        className={cn('text-muted-foreground italic', className)}
      >
        {t('notAvailable')}
      </span>
    );
  }

  return (
    <span className={className}>{format ? format(value) : String(value)}</span>
  );
};
