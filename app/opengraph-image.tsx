import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'ChatToSales — Turn WhatsApp chats into sales';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a1f0a',
          padding: '60px',
          gap: '48px',
        }}
      >
        {/* Icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://chattosales.com/chattosales-icon.png"
          alt=""
          width={220}
          height={220}
          style={{ borderRadius: '32px' }}
        />

        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
            }}
          >
            ChatToSales
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: '#a3d9a3',
              lineHeight: 1.4,
              maxWidth: '600px',
            }}
          >
            Turn WhatsApp chats into sales.
            <br />
            Set up your store. List products. Receive orders.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
