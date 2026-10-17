-- Rapport LinkedInForge : entonnoir par jour et par source (14 derniers jours)
SELECT
    toDate(timestamp) AS Jour,
    multiIf(
        session.$entry_utm_medium = 'paid', concat('Pub ', session.$entry_utm_source),
        session.$entry_referring_domain IN ('$direct', ''), 'Direct',
        session.$entry_referring_domain
    ) AS Source,
    uniqIf(distinct_id, event = '$pageview') AS Visiteurs,
    uniqIf($session_id, event = '$pageview' AND session.$session_duration < 5) AS Sessions_moins_5s,
    round(avgIf(session.$session_duration, event = '$pageview')) AS Duree_moy_session_s,
    uniqIf(distinct_id, event = '$autocapture') AS Ont_clique,
    uniqIf(distinct_id, event = 'cta_click') AS Clic_CTA,
    uniqIf(distinct_id, event = 'studio_view') AS Studio_ouvert,
    uniqIf(distinct_id, event = 'sign_up') AS Inscriptions,
    uniqIf(distinct_id, event = 'login') AS Connexions,
    uniqIf(distinct_id, event = 'landing_flow_step' AND properties.step_number = 1) AS Accueil_source,
    uniqIf(distinct_id, event = 'landing_flow_step' AND properties.step_number = 2) AS Accueil_ton,
    uniqIf(distinct_id, event = 'landing_flow_step' AND properties.step_number = 3) AS Accueil_email,
    uniqIf(distinct_id, event = 'flow_step_completed' AND properties.step_number = 1) AS Etape1_source,
    uniqIf(distinct_id, event = 'flow_step_completed' AND properties.step_number = 2) AS Etape2_style,
    uniqIf(distinct_id, event = 'flow_step_completed' AND properties.step_number = 3) AS Etape3_post_valide,
    uniqIf(distinct_id, event = 'flow_step_completed' AND properties.step_number = 4) AS Etape4_publie,
    uniqIf(distinct_id, event = 'generation_started') AS Generation_lancee,
    uniqIf(distinct_id, event = 'generation_completed') AS Post_genere,
    uniqIf(distinct_id, event = 'generation_failed') AS Generation_echouee,
    uniqIf(distinct_id, event = 'content_copied') AS Post_copie,
    uniqIf(distinct_id, event = 'social_connected') AS Reseau_connecte,
    uniqIf(distinct_id, event = 'direct_published') AS Post_publie,
    uniqIf(distinct_id, event = 'paywall_viewed') AS Paywall_vu,
    uniqIf(distinct_id, event = 'begin_checkout') AS Checkout,
    uniqIf(distinct_id, event = 'purchase') AS Achat
FROM events
WHERE timestamp >= now() - INTERVAL 14 DAY
  AND properties.$host = 'linkedinforge.fr'
GROUP BY Jour, Source
ORDER BY Jour DESC, Visiteurs DESC
