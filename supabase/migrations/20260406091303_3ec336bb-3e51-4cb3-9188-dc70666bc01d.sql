INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('EMIL', 'Electronics Mart India Ltd', 'Consumer Durables', 'EMIL', 'Small Cap')
ON CONFLICT DO NOTHING;