# Trustless Auth

Trustless authentication is a way for a user to log in without sharing their password. It would be great if companies started doing this because apparently they keep getting hacked and user passwords are leaked.

Trustless authentication is also very useful for P2P applications where there is no trusted server.

# How it works

First the user converts their password to a secret key. From the secret key, they generate the public key. They public key is stored for each user by the server during sign up / password change, instead of a password hash. To authenticate a user, the server can send them a token for them to encrypt. The user should then encrypt the message using their password converted to a private key and send the encrypted message back to the server. The server can then check that the message was in fact encrypted by the private key that belongs to the public key that it knows and the user must therefore know the password. 

One cool thing someone might do is to use the current timestamp as the token. The server then wouldn't have to send the token to the user and the server wouldn't have to keep a list of active sessions.


# Functions

Note that all functions take and produce strings, since strings are generally a bit easier to work with for web and databases.

### trustless_auth.get_secret_key(password)
Takes a string and converts it to a secret key.

### trustless_auth.get_public_key(private_key)
Takes a private key and returns its public key.

### trustless_auth.encrypt_message(secret_key, message)
Encrypt a message with a secret key.

### trustless_auth.verify_message(user_public_key, original_message, encrypted_message)
Verify that a message has been encrypted by the a public key that corresponds to a private key. (The fact that you don't need the private key for this is where the magic of public key cryptography comes from.)

# Technical details

This uses the Secp256k1 ECDSA (the BitCoin curve).

# License

This code is [CC0](https://creativecommons.org/share-your-work/public-domain/cc0/).
