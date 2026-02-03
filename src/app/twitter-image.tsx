import { ImageResponse } from 'next/og'

export const alt = 'Nawaetu - Teman Ibadahmu'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    backgroundImage: 'radial-gradient(circle at 50% 0%, #10b981 0%, transparent 40%)',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '32px',
                        padding: '40px 80px',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        boxShadow: '0 0 50px rgba(16, 185, 129, 0.2)',
                    }}
                >
                    {/* Logo Icon */}
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '20px',
                            backgroundColor: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px',
                            fontSize: '48px',
                            fontWeight: 'bold',
                        }}
                    >
                        N
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            fontSize: 64,
                            fontWeight: 900,
                            background: 'linear-gradient(to right, #ffffff, #a7f3d0)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            marginBottom: 12,
                        }}
                    >
                        Nawaetu
                    </div>

                    {/* Subtitle */}
                    <div
                        style={{
                            fontSize: 28,
                            color: '#94a3b8',
                            textAlign: 'center',
                            maxWidth: '600px',
                        }}
                    >
                        Teman Ibadah Modern & Mentor AI
                    </div>

                    {/* Features Badge Row */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                        <div style={{ padding: '8px 16px', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '18px', color: '#e2e8f0' }}>Jadwal Sholat</div>
                        <div style={{ padding: '8px 16px', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '18px', color: '#e2e8f0' }}>Al-Qur'an</div>
                        <div style={{ padding: '8px 16px', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '18px', color: '#e2e8f0' }}>Arah Kiblat</div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
