-- Backfill users.name values polluted by a prior Google-OAuth signup bug
-- that joined firstName + lastName with a literal space, producing
-- "<given> undefined" when Google's profile lacked a familyName
-- (mononym users / some locales). Strip leading/trailing "undefined"
-- tokens, collapse whitespace, and fall back to the email local-part
-- when the cleaned string is empty (mirrors the application-layer fix
-- in validate-google-user.usecase.ts).

UPDATE "users"
SET "name" = COALESCE(
    NULLIF(
        TRIM(BOTH ' ' FROM
            REGEXP_REPLACE(
                REGEXP_REPLACE("name", '^undefined(\s+|$)', '', 'g'),
                '(^|\s+)undefined$', '', 'g'
            )
        ),
        ''
    ),
    SPLIT_PART("email", '@', 1)
)
WHERE "name" ~ '(^|\s)undefined($|\s)';
