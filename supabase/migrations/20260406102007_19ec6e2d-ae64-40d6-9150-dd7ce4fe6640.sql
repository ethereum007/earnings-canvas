INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ANANDRATHI', 'Anand Rathi Wealth Ltd', 'Financial Services', 'ANANDRATHI', 'Mid Cap')
ON CONFLICT DO NOTHING;