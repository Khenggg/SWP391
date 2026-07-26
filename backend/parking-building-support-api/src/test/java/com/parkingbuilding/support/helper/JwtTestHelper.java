package com.parkingbuilding.support.helper;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import java.util.Date;

/**
 * Test helper for generating HMAC HS256 JWTs that match the SecurityConfig of
 * parking-building-support-api.
 *
 * <p>JWT validation chain (SecurityConfig):
 * <ol>
 *   <li>Signature verified with {@code jwt.secret} (HMAC HS256)</li>
 *   <li>Issuer must equal {@code jwt.issuer}</li>
 *   <li>Audience must equal {@code jwt.audience}</li>
 *   <li>Expiry ({@code exp}) must be in the future</li>
 * </ol>
 *
 * <p>All constants mirror {@code application-test.yml} / {@code application.yml} dev values.
 */
public final class JwtTestHelper {

    // ─── Must match application-test.yml ──────────────────────────────────────
    public static final String SECRET  = "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391";
    public static final String ISSUER  = "ParkingBuilding.CoreApi";
    public static final String AUDIENCE = "ParkingBuilding.Frontend";

    private static final String WRONG_SECRET = "WRONG_SECRET_AAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    private JwtTestHelper() {}

    // ─── Public factory methods ────────────────────────────────────────────────

    /**
     * Builds a fully valid, non-expired JWT with the given role and userId.
     *
     * @param role   e.g. "ADMIN", "STAFF", "DRIVER"
     * @param userId numeric string, e.g. "42"
     */
    public static String buildValidToken(String role, String userId) {
        return buildToken(SECRET, ISSUER, AUDIENCE, role, userId, futureDate(3600));
    }

    /**
     * Builds a JWT whose {@code exp} is set 1 second in the past.
     * NimbusJwtDecoder will reject this with an expiry validation error → 401.
     */
    public static String buildExpiredToken() {
        return buildToken(SECRET, ISSUER, AUDIENCE, "STAFF", "1", pastDate(1));
    }

    /**
     * Builds a structurally valid JWT but signed with a different secret key.
     * Signature verification will fail → 401.
     */
    public static String buildTokenWithWrongSecret() {
        return buildToken(WRONG_SECRET, ISSUER, AUDIENCE, "STAFF", "1", futureDate(3600));
    }

    /**
     * Builds a JWT signed with the correct secret but with a wrong {@code iss} claim.
     * Issuer validator rejects it → 401.
     */
    public static String buildTokenWithWrongIssuer() {
        return buildToken(SECRET, "AttackerIssuer", AUDIENCE, "STAFF", "1", futureDate(3600));
    }

    /**
     * Builds a JWT signed with the correct secret but with a wrong {@code aud} claim.
     * Audience validator rejects it → 401.
     */
    public static String buildTokenWithWrongAudience() {
        return buildToken(SECRET, ISSUER, "BadAudience", "STAFF", "1", futureDate(3600));
    }

    // ─── Internal builder ─────────────────────────────────────────────────────

    private static String buildToken(
            String secret,
            String issuer,
            String audience,
            String role,
            String userId,
            Date expiry) {
        try {
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer(issuer)
                    .audience(audience)
                    .subject("test-user-" + userId)
                    .claim("user_id", userId)
                    .claim("username", "test.user")
                    .claim("fullName", "Test User")
                    .claim("role", role)
                    .claim("sid", "00000000-0000-0000-0000-000000000001")
                    .issueTime(new Date())
                    .expirationTime(expiry)
                    .jwtID("test-jti-" + System.nanoTime())
                    .build();

            JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
            SignedJWT signedJWT = new SignedJWT(header, claims);

            JWSSigner signer = new MACSigner(secret.getBytes());
            signedJWT.sign(signer);

            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("Failed to build test JWT", e);
        }
    }

    // ─── Time helpers ─────────────────────────────────────────────────────────

    private static Date futureDate(int secondsFromNow) {
        return new Date(System.currentTimeMillis() + (long) secondsFromNow * 1000);
    }

    private static Date pastDate(int secondsAgo) {
        return new Date(System.currentTimeMillis() - (long) secondsAgo * 1000);
    }
}
