INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('SBFC', 'SBFC Finance Ltd', 'NBFC', 'SBFC', 'Small Cap')
ON CONFLICT DO NOTHING;