import { NextResponse } from 'next/server';

const BRIDGE_API_BASE_URL = 'https://api.bridgeapi.io/v3';
const BRIDGE_VERSION = '2021-06-01'; // Using a stable version, or use '2025-01-15' if confirmed

export async function POST(request: Request) {
    try {
        const { userEmail } = await request.json();

        if (!userEmail) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const clientId = process.env.NEXT_PUBLIC_BRIDGE_CLIENT_ID!;
        const clientSecret = process.env.BRIDGE_CLIENT_SECRET!;

        // 1. Authenticate User (Get Access Token)
        let accessToken = await getAccessToken(userEmail, clientId, clientSecret);

        // If user not found (404), create user and retry
        if (!accessToken) {
            console.log('User not found, creating new Bridge user...');
            await createBridgeUser(userEmail, clientId, clientSecret);
            accessToken = await getAccessToken(userEmail, clientId, clientSecret);
        }

        if (!accessToken) {
            throw new Error('Failed to obtain access token after user creation');
        }

        // 2. Create Connect Session
        const response = await fetch(`${BRIDGE_API_BASE_URL}/aggregation/connect-sessions`, {
            method: 'POST',
            headers: {
                'Bridge-Version': BRIDGE_VERSION,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`, // User Access Token
                'Client-Id': clientId,
                'Client-Secret': clientSecret,
            },
            body: JSON.stringify({
                user_email: userEmail,
                parent_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Bridge Connect Session Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to create Bridge session', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('API Handler Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

async function getAccessToken(externalUserId: string, clientId: string, clientSecret: string): Promise<string | null> {
    const response = await fetch(`${BRIDGE_API_BASE_URL}/aggregation/authorization/token`, {
        method: 'POST',
        headers: {
            'Bridge-Version': BRIDGE_VERSION,
            'Content-Type': 'application/json',
            'Client-Id': clientId,
            'Client-Secret': clientSecret,
        },
        body: JSON.stringify({ external_user_id: externalUserId }),
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        const txt = await response.text();
        console.error('Get Token Error:', txt);
        throw new Error(`Failed to get token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function createBridgeUser(externalUserId: string, clientId: string, clientSecret: string) {
    const response = await fetch(`${BRIDGE_API_BASE_URL}/aggregation/users`, {
        method: 'POST',
        headers: {
            'Bridge-Version': BRIDGE_VERSION,
            'Content-Type': 'application/json',
            'Client-Id': clientId,
            'Client-Secret': clientSecret,
        },
        body: JSON.stringify({ external_user_id: externalUserId }),
    });

    if (!response.ok) {
        const txt = await response.text();
        console.error('Create User Error:', txt);
        throw new Error(`Failed to create user: ${response.status}`);
    }

    return await response.json();
}
