import { NextResponse } from 'next/server';

const BRIDGE_API_BASE_URL =
    process.env.NEXT_PUBLIC_BRIDGE_ENVIRONMENT === 'sandbox'
        ? 'https://api.bridgeapi.io/v3'
        : 'https://api.bridgeapi.io/v3';

export async function POST(request: Request) {
    try {
        const { userEmail } = await request.json();

        const response = await fetch(
            `${BRIDGE_API_BASE_URL}/aggregation/connect-sessions`,
            {
                method: 'POST',
                headers: {
                    'Bridge-Version': '2025-01-15',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.BRIDGE_CLIENT_SECRET}`,
                    'Client-Id': process.env.NEXT_PUBLIC_BRIDGE_CLIENT_ID!,
                },
                body: JSON.stringify({
                    user_email: userEmail,
                    parent_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Bridge API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to create Bridge session' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating Bridge session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
