-- SELECT * from users;
-- select * from follows where follows.user_following_id = 301;
-- SELECT * from likes;
-- SELECT * from messages;
-- 
-- SELECT * from users where username = 'roger';
-- UPDATE users SET header_image_url = 'https://images.unsplash.com/photo-1488229297570-58520851e868?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80' where username = 'roger';
-- UPDATE users SET bio = 'My relationship with coding started at a young age, and has become my life-long love.' where username = 'roger';
-- UPDATE users SET "location" = 'Brandon, FL' where username = 'roger';
-- INSERT into follows (user_being_followed_id, user_following_id)
-- VALUES (301, 2), (301, 222), (301, 124), (301, 65), (301, 87), (301, 5), (301, 90), (301, 12), (301, 15) ,
-- (200, 301) , (101, 301), (19, 301), (199, 301), (34, 301), (32, 301), (33, 301), (299, 301), (300, 301)
-- 
-- SELECT f.user_following_id from users as u 
-- join follows as f on u.id = f.user_being_followed_id where u.id = 301;
-- SELECT * from messages 
-- where user_id 
-- in 
-- (SELECT f.user_following_id as user_id 
-- from users as u 
-- join follows as f on u.id = f.user_being_followed_id 
-- where u.id = 301) 
-- order by "messages"."timestamp" desc;

-- UPDATE users SET "password" = '$2b$12$vmILJe5WoSw1tFto6yOwI.tHWAMM6y8xarCiBx8cEQum5XqknfaHy'

-- SELECT * FROM likes WHERE user_id = 227


