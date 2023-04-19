CREATE TABLE IF NOT EXISTS accounts
(
    id         INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    email      VARCHAR(256)     NOT NULL,
    username   VARCHAR(256),
    created_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP        NULL     DEFAULT CURRENT_TIMESTAMP ON
        UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY (email, username)
);

CREATE TABLE IF NOT EXISTS accounts_organisations
(
    account_id      INT(10)                    NOT NULL,
    organisation_id INT(10)                    NOT NULL,
    confirmed       BOOLEAN                    NOT NULL,
    role            ENUM ('manager', 'member') NOT NULL,
    created_at      TIMESTAMP                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP                  NULL     DEFAULT CURRENT_TIMESTAMP ON
        UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (account_id, organisation_id)
);

CREATE TABLE IF NOT EXISTS organisations
(
    id   INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(256),

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS accounts_boards
(
    account_id INT(10) UNSIGNED         NOT NULL,
    board_id   INT(10) UNSIGNED         NOT NULL,
    permission ENUM ('owner', 'member') NOT NULL,

    PRIMARY KEY (account_id, board_id)
);

CREATE TABLE IF NOT EXISTS boards
(
    id              INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    slug            VARCHAR(256),
    organisation_id INT(20) UNSIGNED NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (organisation_id)
        REFERENCES organisations (id)
);

# partition cards
CREATE TABLE IF NOT EXISTS cards
(
    id           INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    descriptions VARCHAR(256),
    board_id     INT(10) UNSIGNED NOT NULL,
    assigned_to  INT(10) UNSIGNED,
    reported_by  INT(10) UNSIGNED NOT NULL,
    created_at   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (board_id)
        REFERENCES boards (id),
    FOREIGN KEY (assigned_to) # probably, linking table.
        REFERENCES accounts (id),
    FOREIGN KEY (reported_by)
        REFERENCES accounts (id)
);
