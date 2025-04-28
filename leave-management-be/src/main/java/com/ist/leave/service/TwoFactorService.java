package com.ist.leave.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.IGoogleAuthenticator;
import org.springframework.stereotype.Service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class TwoFactorService {

    private final IGoogleAuthenticator gAuth;

    public TwoFactorService() {
        this.gAuth = new GoogleAuthenticator();
    }

    /**
     * Generate a new secret credentials for TOTP
     */
    public GoogleAuthenticatorKey generateCredentials() {
        return gAuth.createCredentials();
    }

    /**
     * Build a standard otpauth URL that can be scanned by Authenticator apps
     */
    public String getQRCodeURL(String appName, String userEmail, GoogleAuthenticatorKey key) {
        String secret = key.getKey();
        // Label format: Issuer:Account
        String label = appName + ":" + userEmail;
        // URL-encode label and issuer
        String encodedLabel = URLEncoder.encode(label, StandardCharsets.UTF_8);
        String encodedIssuer = URLEncoder.encode(appName, StandardCharsets.UTF_8);
        // otpauth://totp/{label}?secret={secret}&issuer={issuer}
        return "otpauth://totp/" + encodedLabel + "?secret=" + secret + "&issuer=" + encodedIssuer;
    }

    /**
     * Verify the provided TOTP code against the stored secret
     */
    public boolean verifyCode(String secret, int code) {
        return gAuth.authorize(secret, code);
    }
} 