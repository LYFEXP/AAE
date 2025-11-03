import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOfferBySlug, logClick } from '../lib/supabase';

export default function Redirect() {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function handleRedirect() {
      if (!slug) {
        setError(true);
        return;
      }

      try {
        const offer = await getOfferBySlug(slug);

        if (!offer || !offer.deeplink_template) {
          setError(true);
          return;
        }

        const hashIP = async (ip: string) => {
          const encoder = new TextEncoder();
          const data = encoder.encode(ip);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        };

        const hashUA = async (ua: string) => {
          const encoder = new TextEncoder();
          const data = encoder.encode(ua);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        };

        const ip = 'unknown';
        const ua = navigator.userAgent;

        const [ipHash, uaHash] = await Promise.all([
          hashIP(ip),
          hashUA(ua)
        ]);

        await logClick({
          link_slug: slug,
          ip_hash: ipHash,
          ua_hash: uaHash
        });

        window.location.href = offer.deeplink_template;
      } catch (err) {
        console.error('Error handling redirect:', err);
        setError(true);
      }
    }

    handleRedirect();
  }, [slug]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-600">This affiliate link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
