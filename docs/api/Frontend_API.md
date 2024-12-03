/register (Register)
/login (Login)
/logout (Logout)

/main (Get main window)
    - (Get chat list) /api/chat/:user_id
    - /favorite (Go to favorite)

/main/profile/:user_id (Check profile)
/main/profile/:user_id/update (Change the profile)
/main/options (Change the options)
    - /theme (Toggle dark/light theme)
    - /push (Toggle push notification)
/main/create-chat (Create chat)
/main/search-chat (Search chat by title)
/main/chat/:chatId
