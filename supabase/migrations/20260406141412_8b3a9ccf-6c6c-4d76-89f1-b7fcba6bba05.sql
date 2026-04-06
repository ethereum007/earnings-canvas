INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('LATENTVIEW', 'Latent View Analytics Ltd', 'IT - Analytics', 'LATENTVIEW', 'Small Cap')
ON CONFLICT DO NOTHING;