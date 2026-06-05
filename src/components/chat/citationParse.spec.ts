import { describe, expect, it } from 'vitest';
import { parseCitationForPdf, shortCitationLabel } from './citationParse';

describe('parseCitationForPdf', () => {
  it('parses document with Pages N-M range (comma-separated tail)', () => {
    const raw = 'MTNNN.pdf, Pages 2-30, Multiple Sections';
    const { documentName, pageNumbers } = parseCitationForPdf(raw);
    expect(documentName).toBe('MTNNN.pdf');
    expect(pageNumbers[0]).toBe(2);
    expect(pageNumbers[pageNumbers.length - 1]).toBe(30);
    expect(pageNumbers.length).toBe(29);
  });

  it('parses Pages: N-M with optional colon', () => {
    const { pageNumbers } = parseCitationForPdf('Lease.pdf Pages: 5-7');
    expect(pageNumbers).toEqual([5, 6, 7]);
  });

  it('caps very large ranges to first page only', () => {
    const { pageNumbers } = parseCitationForPdf('Doc.pdf Page 1-500');
    expect(pageNumbers).toEqual([1]);
  });
});

describe('shortCitationLabel', () => {
  it('shows pdf stem and page span for Pages N-M', () => {
    const label = shortCitationLabel('MTNNN.pdf, Pages 2-30, Multiple Sections');
    expect(label).toContain('p.2');
    expect(label).toContain('30');
    expect(label.toLowerCase()).toContain('mtnnn');
  });
});
