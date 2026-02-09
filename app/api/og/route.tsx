import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

/**
 * 鍔ㄦ€佺敓鎴?Open Graph 鍥剧墖
 * 浣跨敤绀轰緥: /api/og?title=鏍囬&description=鎻忚堪
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const title = searchParams.get('title') || 'Visora'
    const description = searchParams.get('description') || 'AI Image Generation & Analysis Platform'

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
            backgroundColor: '#0F172A',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {/* 涓诲唴瀹瑰鍣?*/}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              maxWidth: '1000px',
            }}
          >
            {/* Logo/Brand 鍖哄煙 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(to right, #fff, #e0e7ff)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                馃帹 Visora
              </div>
            </div>

            {/* 鏍囬 */}
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                marginBottom: '30px',
                lineHeight: 1.2,
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>

            {/* 鎻忚堪 */}
            <p
              style={{
                fontSize: '32px',
                color: '#E0E7FF',
                textAlign: 'center',
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              {description}
            </p>

            {/* 搴曢儴鏍囩 */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginTop: '50px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '12px 24px',
                  fontSize: '20px',
                  color: 'white',
                }}
              >
                AI Image Tools
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '12px 24px',
                  fontSize: '20px',
                  color: 'white',
                }}
              >
                褰㈣薄鍏嬮殕
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '12px 24px',
                  fontSize: '20px',
                  color: 'white',
                }}
              >
                澹伴煶鍏嬮殕
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}


