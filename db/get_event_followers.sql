SELECT attending, username, first_name, last_name FROM following f
inner join users u on u.user_id = f.user_id
WHERE event_id = $1;
