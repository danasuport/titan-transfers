<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>XML Sitemap — Titan Transfers</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8faf0; color: #242426; font-size: 14px; }
          #header { background: #242426; color: #fff; padding: 20px 40px; display: flex; align-items: center; gap: 16px; }
          #header svg { width: 32px; height: 32px; fill: #9DC41A; flex-shrink: 0; }
          #header h1 { font-size: 1.3rem; font-weight: 700; letter-spacing: -0.02em; }
          #header p { font-size: 0.82rem; color: #aaa; margin-top: 2px; }
          #content { max-width: 1100px; margin: 0 auto; padding: 32px 24px 64px; }
          .info-box { background: #fff; border: 1px solid #e2e8d0; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px; font-size: 0.84rem; color: #475569; line-height: 1.6; }
          .info-box strong { color: #242426; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
          thead tr { background: #242426; color: #fff; }
          thead th { padding: 12px 16px; text-align: left; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
          tbody tr { border-bottom: 1px solid #f0f4e8; transition: background 0.15s; }
          tbody tr:last-child { border-bottom: none; }
          tbody tr:hover { background: #f8faf0; }
          tbody td { padding: 10px 16px; font-size: 0.84rem; vertical-align: middle; }
          tbody td a { color: #4a7c10; text-decoration: none; word-break: break-all; }
          tbody td a:hover { text-decoration: underline; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; background: #e8f5c0; color: #3d6b00; }
          .sitemap-link { display: flex; align-items: center; gap: 6px; color: #4a7c10; text-decoration: none; font-weight: 500; }
          .sitemap-link:hover { text-decoration: underline; }
          .count { color: #94a3b8; font-size: 0.78rem; }
        </style>
      </head>
      <body>
        <div id="header">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          <div>
            <h1>XML Sitemap — Titan Transfers</h1>
            <p>This sitemap is generated automatically. Search engines use it to discover all pages.</p>
          </div>
        </div>
        <div id="content">
          <!-- Sitemap index -->
          <xsl:if test="//sitemap:sitemapindex">
            <div class="info-box">
              <strong>Sitemap index</strong> — This index lists all sub-sitemaps grouped by content type.
              There are <strong><xsl:value-of select="count(//sitemap:sitemap)"/></strong> sub-sitemaps in total.
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sitemap URL</th>
                  <th>Last modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="//sitemap:sitemap">
                  <tr>
                    <td class="count"><xsl:value-of select="position()"/></td>
                    <td>
                      <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                    </td>
                    <td><xsl:value-of select="substring(sitemap:lastmod,1,10)"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

          <!-- URL set -->
          <xsl:if test="//sitemap:urlset">
            <div class="info-box">
              <strong>URLs in this sitemap:</strong> <xsl:value-of select="count(//sitemap:url)"/>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>URL</th>
                  <th>Last modified</th>
                  <th>Change freq</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="//sitemap:url">
                  <tr>
                    <td class="count"><xsl:value-of select="position()"/></td>
                    <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                    <td><xsl:value-of select="substring(sitemap:lastmod,1,10)"/></td>
                    <td><xsl:if test="sitemap:changefreq"><span class="badge"><xsl:value-of select="sitemap:changefreq"/></span></xsl:if></td>
                    <td><xsl:value-of select="sitemap:priority"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
