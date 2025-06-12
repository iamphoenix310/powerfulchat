import { Globe, Instagram, Linkedin } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'

interface Props {
  bio?: string
  verified?: boolean
  socialLinks?: {
    twitter?: string
    instagram?: string
    linkedin?: string
    website?: string
  }
}

export default function UserProfileInfo({ bio, socialLinks }: Props) {
  return (
    <div className="mt-3 text-sm text-gray-600 space-y-2 max-w-full overflow-hidden break-words">
      {bio && (
        <p className="text-gray-700 break-words max-w-full">{bio}</p>
      )}

      {socialLinks && (
        <div className="flex flex-wrap items-center gap-4 text-gray-500 overflow-x-auto max-w-full">
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Instagram className="h-5 w-5 hover:text-black" />
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Linkedin className="h-5 w-5 hover:text-black" />
            </a>
          )}
          {socialLinks.website && (
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Globe className="h-5 w-5 hover:text-black" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}