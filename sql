create table
  public.answers (
    id uuid not null default gen_random_uuid (),
    question_id uuid null default gen_random_uuid (),
    is_correct boolean null,
    answer_text text null,
    answer_specific_data jsonb null,
    constraint answers_pkey primary key (id),
    constraint answers_question_id_fkey foreign key (question_id) references questions (id) on update cascade on delete cascade
  ) tablespace pg_default;

create table
  public.game_sessions (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    game_id uuid not null default gen_random_uuid (),
    session_data jsonb null default '{}'::jsonb,
    status text null default 'pending'::text,
    start_time timestamp with time zone null,
    end_time timestamp with time zone null,
    creator_id uuid null default uid (),
    short_id text null,
    constraint game_sessions_pkey primary key (id),
    constraint game_sessions_short_id_key unique (short_id),
    constraint game_sessions_game_id_fkey foreign key (game_id) references games (id) on update cascade on delete cascade,
    constraint game_sessions_creator_id_fkey foreign key (creator_id) references users (id)
  ) tablespace pg_default;

create trigger set_short_id_trigger before insert on game_sessions for each row
execute function set_short_id ();

create trigger clear_short_id_trigger before
update on game_sessions for each row
execute function clear_short_id ();

create table
  public.games (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone null default now(),
    creator_id uuid null,
    title text null,
    settings jsonb null default '{}'::jsonb,
    has_answer boolean null default false,
    description text null,
    constraint games_pkey primary key (id),
    constraint games_creator_fkey foreign key (creator_id) references users (id) on update cascade on delete cascade
  ) tablespace pg_default;

create table
  public.participant_answers (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    participant_id uuid not null default gen_random_uuid (),
    question_id uuid not null default gen_random_uuid (),
    answer_content jsonb null,
    constraint participant_answers_pkey primary key (id),
    constraint participant_answers_participant_id_fkey foreign key (participant_id) references participants (id) on update cascade on delete cascade,
    constraint participant_answers_question_id_fkey foreign key (question_id) references questions (id) on update cascade on delete cascade
  ) tablespace pg_default;

create table
  public.participants (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    game_session_id uuid not null,
    nickname text not null,
    score bigint null default '0'::bigint,
    constraint participants_pkey primary key (id),
    constraint participants_game_session_id_fkey foreign key (game_session_id) references game_sessions (id) on update cascade on delete cascade
  ) tablespace pg_default;

create table
  public.questions (
    id uuid not null default gen_random_uuid (),
    game_id uuid not null default gen_random_uuid (),
    question_type text null,
    question_text text null,
    media_content jsonb null,
    time bigint null,
    question_specific_data jsonb null,
    index integer not null default 0,
    constraint questions_pkey primary key (id),
    constraint questions_game_id_fkey foreign key (game_id) references games (id) on update cascade on delete cascade
  ) tablespace pg_default;
