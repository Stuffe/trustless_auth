# Trustless Auth

Trustless authentication is a way for a user to log in without sharing their password. It would be great if companies started doing this because apparently they keep getting hacked and user passwords are leaked.

Trustless authentication is also very useful for P2P applications where there is no trusted server.

# How it works

Check out the source code of example.html.

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
