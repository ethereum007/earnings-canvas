INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('PNBHOUSING', 'PNB Housing Finance Ltd', 'Financial Services', 'PNBHOUSING', 'Mid Cap')
ON CONFLICT DO NOTHING;