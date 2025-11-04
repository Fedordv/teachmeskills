create table users (
	id bigserial primary key,
	first_name text not null,
	last_name text not null,
	date_of_birth date not null,
	email text not null unique,
	is_active boolean default true,
	created_at timestamp not null default now()
);

insert into users (first_name, last_name, date_of_birth, email, is_active) values 
('Fedor', 'Dobrynin', '13-01-2004', 'fedor@gmail.com', true),
('Dima', 'Ivanov', '25-09-2003', 'dima@gmail.com', false),
('Sasha', 'Shkutko', '25-12-2008', 'sasha@gmail.com', false),
('Vladimir', 'Dobrynin', '22-09-1971', 'vladimir@gmail.com', true),
('Svetlana', 'Shoroh', '08-03-1975', 'sveta@gmail.com', true)

update users set last_name = 'Shoroh' where id = 5;


select * from users
where is_active  = true
