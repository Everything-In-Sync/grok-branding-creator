import React, { useEffect } from 'react'
import { Typography } from '../../../shared/types.js'
import './TypographyPreview.css'

interface TypographyPreviewProps {
  typography: Typography
  primaryColor: string
}

export function TypographyPreview({ typography, primaryColor }: TypographyPreviewProps) {
  useEffect(() => {
    // Load Google Fonts
    if (typography.links && typography.links.length > 0) {
      typography.links.forEach(link => {
        if (!document.querySelector(`link[href="${link}"]`)) {
          const linkElement = document.createElement('link')
          linkElement.href = link
          linkElement.rel = 'stylesheet'
          document.head.appendChild(linkElement)
        }
      })
    }
  }, [typography.links])

  return (
    <div className="typography-preview">
      <div className="font-info">
        <div className="font-pair">
          <h4>Headline Font</h4>
          <p className="font-name">{typography.headline}</p>
          <p className="font-weights">
            Weights: {typography.headlineWeights.join(', ')}
          </p>
        </div>

        <div className="font-pair">
          <h4>Body Font</h4>
          <p className="font-name">{typography.body}</p>
          <p className="font-weights">
            Weights: {typography.bodyWeights.join(', ')}
          </p>
        </div>
      </div>

      <div className="typography-samples">
        <div
          className="sample-headline"
          style={{
            fontFamily: typography.headline,
            color: primaryColor
          }}
        >
          {typography.headline} Headline
        </div>

        <div
          className="sample-body"
          style={{
            fontFamily: typography.body
          }}
        >
          {typography.body} body text provides excellent readability and works well
          with the {typography.headline} headline font. This combination creates a
          harmonious typographic hierarchy that enhances your brand's visual identity.
        </div>
      </div>
    </div>
  )
}
