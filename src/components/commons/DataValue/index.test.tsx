import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import en from '../../../i18n/messages/en.json';
import vi from '../../../i18n/messages/vi.json';
import { DataValue } from '.';

const withIntl = (ui: ReactNode, locale: 'en' | 'vi' = 'en') =>
  render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === 'en' ? en : vi}
    >
      {ui}
    </NextIntlClientProvider>,
  );

afterEach(cleanup);

describe('DataValue', () => {
  it('shows "Not available yet" when the data was not entered', () => {
    withIntl(<DataValue value={null} missingReason="notEntered" />);

    const missing = screen.getByText('Not available yet');
    expect(missing).toHaveAttribute('title', 'Not entered yet');
  });

  it('shows "Not available yet" when the data was not synced', () => {
    withIntl(<DataValue value={undefined} missingReason="notSynced" />);

    const missing = screen.getByText('Not available yet');
    expect(missing).toHaveAttribute('title', 'Not synced yet');
  });

  it('shows a real 0 as 0', () => {
    withIntl(<DataValue value={0} missingReason="notSynced" />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText('Not available yet')).not.toBeInTheDocument();
  });

  it('passes a present value to the formatter, including 0', () => {
    withIntl(
      <DataValue
        value={0}
        missingReason="notEntered"
        format={value => `${value} ₫`}
      />,
    );

    expect(screen.getByText('0 ₫')).toBeInTheDocument();
  });

  it('does not call the formatter for a missing value', () => {
    withIntl(
      <DataValue
        value={null}
        missingReason="notEntered"
        format={() => {
          throw new Error('format must not run for a missing value');
        }}
      />,
    );

    expect(screen.getByText('Not available yet')).toBeInTheDocument();
  });

  it('follows the active language', () => {
    withIntl(<DataValue value={null} missingReason="notSynced" />, 'vi');

    const missing = screen.getByText('Chưa có dữ liệu');
    expect(missing).toHaveAttribute('title', 'Chưa đồng bộ');
  });

  it('works in a card, a table and a chart', () => {
    withIntl(
      <>
        <section aria-label="card">
          <DataValue value={null} missingReason="notSynced" />
        </section>
        <table>
          <tbody>
            <tr>
              <td>
                <DataValue value={null} missingReason="notEntered" />
              </td>
              <td>
                <DataValue value={0} missingReason="notEntered" />
              </td>
            </tr>
          </tbody>
        </table>
        <figure aria-label="chart">
          <figcaption>
            <DataValue value={null} missingReason="notSynced" />
          </figcaption>
        </figure>
      </>,
    );

    expect(screen.getByRole('region', { name: 'card' })).toHaveTextContent(
      'Not available yet',
    );
    const cells = screen.getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Not available yet');
    expect(cells[1]).toHaveTextContent('0');
    expect(screen.getByRole('figure', { name: 'chart' })).toHaveTextContent(
      'Not available yet',
    );
  });
});
