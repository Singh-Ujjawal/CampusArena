/**
 * Lightweight JWT utility — decodes the payload locally WITHOUT any API call.
 * Used to check token expiry before mounting the app and before protected actions.
 */

interface JwtPayload {
    sub: string;   // username
    iat: number;   // issued-at  (seconds)
    exp: number;   // expiry     (seconds)
}

/**
 * Decode a JWT without verifying signature (signature is validated server-side).
 * Returns null on any parse error.
 */
export function decodeToken(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        
        const base64Payload = parts[1];
        // atob requires standard base64; JWT uses base64url — replace chars + pad
        const json = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json) as JwtPayload;
    } catch (error) {
        console.error("JWT Decode Error:", error);
        return null;
    }
}

/**
 * Returns true if the token is present AND not expired.
 * Adds a 10-second buffer so we treat tokens expiring very soon as expired.
 */
export function isTokenValid(token: string | null): boolean {
    if (!token) return false;
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowSeconds + 10; // 10s buffer
}

/**
 * Returns milliseconds until the token expires.
 * Returns 0 if already expired or invalid.
 */
export function msUntilExpiry(token: string | null): number {
    if (!token) return 0;
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return 0;
    const expiresAt = payload.exp * 1000; // to ms
    const remaining = expiresAt - Date.now();
    return Math.max(0, remaining);
}
