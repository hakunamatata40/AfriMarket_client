import { Colors } from '@/constants/colors';
import { fetchOffer, fetchOffers, Offer } from '@/services/offers.service';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MarkerData {
  relayId: string;
  relayName: string;
  address: string;
  lat: number;
  lng: number;
  offerId: string;
  offerTitle: string;
  photo: string;
  price: number;
  unit: string;
}

const YAOUNDE_LAT = 3.848;
const YAOUNDE_LNG = 11.502;

function buildLeafletHtml(markers: MarkerData[]): string {
  const markersJson = JSON.stringify(markers);
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html,body,#map{height:100%;margin:0;padding:0;background:#F7F2EA}
    .popup-img{width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:6px}
    .popup-title{font-weight:bold;font-size:14px;margin:4px 0;color:#1C1208}
    .popup-sub{font-size:12px;color:#7A6248;margin:2px 0}
    .popup-price{color:#E8641A;font-weight:bold;margin:4px 0;font-size:13px}
    .popup-btn{background:#E8641A;color:white;border:none;padding:8px 12px;border-radius:8px;width:100%;cursor:pointer;margin-top:8px;font-size:13px;font-weight:bold}
    .popup-btn:hover{background:#D45310}
    .leaflet-popup-content{min-width:180px;max-width:200px}
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([${YAOUNDE_LAT}, ${YAOUNDE_LNG}], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  var markers = ${markersJson};

  markers.forEach(function(m) {
    var popup = '<div>';
    if (m.photo) {
      popup += '<img class="popup-img" src="' + m.photo + '" onerror="this.style.display=\\'none\\'"/>';
    }
    popup += '<div class="popup-title">' + m.relayName + '</div>';
    if (m.address) {
      popup += '<div class="popup-sub">' + m.address + '</div>';
    }
    popup += '<div class="popup-sub" style="font-weight:600;margin-top:4px">' + m.offerTitle + '</div>';
    popup += '<div class="popup-price">' + m.price.toLocaleString('fr-FR') + ' FCFA / ' + m.unit + '</div>';
    popup += '<button class="popup-btn" onclick="window.ReactNativeWebView.postMessage(\\'' + m.offerId + '\\')">Voir l\\'offre →</button>';
    popup += '</div>';
    L.marker([m.lat, m.lng]).addTo(map).bindPopup(popup, { maxWidth: 220 });
  });
</script>
</body>
</html>`;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    loadMarkers();
  }, []);

  async function loadMarkers() {
    setLoading(true);
    setError(null);
    try {
      const offers = await fetchOffers();
      const activeOffers = offers.filter(o => o.status === 'ACTIVE' || o.status === 'THRESHOLD_REACHED');

      // Fetch relay data for each offer (limit to avoid too many requests)
      const offerDetails = await Promise.allSettled(
        activeOffers.slice(0, 20).map(o => fetchOffer(o.id))
      );

      const newMarkers: MarkerData[] = [];
      let offsetIndex = 0;

      offerDetails.forEach((result, i) => {
        const baseOffer = activeOffers[i];
        const offer: Offer | null =
          result.status === 'fulfilled' ? result.value : baseOffer;

        if (!offer) return;

        const photo = offer.photos?.[0] ?? '';

        offer.relays.forEach(relay => {
          // Use relay coords if available, otherwise random offset around Yaoundé
          const hasCoords =
            (relay as any).lat && (relay as any).lng &&
            ((relay as any).lat !== 0 || (relay as any).lng !== 0);

          const lat = hasCoords
            ? Number((relay as any).lat)
            : YAOUNDE_LAT + (Math.random() - 0.5) * 0.08;
          const lng = hasCoords
            ? Number((relay as any).lng)
            : YAOUNDE_LNG + (Math.random() - 0.5) * 0.08;

          newMarkers.push({
            relayId: relay.id,
            relayName: relay.name,
            address: relay.address ?? '',
            lat,
            lng,
            offerId: offer.id,
            offerTitle: offer.title,
            photo,
            price: offer.pricePerUnit,
            unit: offer.unit,
          });
          offsetIndex++;
        });
      });

      setMarkers(newMarkers);
    } catch (e: any) {
      setError(e.message ?? 'Impossible de charger la carte.');
    } finally {
      setLoading(false);
    }
  }

  function handleWebViewMessage(event: { nativeEvent: { data: string } }) {
    const offerId = event.nativeEvent.data;
    if (offerId) {
      router.push(`/offer/${offerId}` as any);
    }
  }

  const htmlContent = buildLeafletHtml(markers);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carte des offres</Text>
        {!loading && (
          <Text style={styles.headerSub}>{markers.length} point{markers.length !== 1 ? 's' : ''} de retrait</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.orange} />
          <Text style={styles.loadingText}>Chargement de la carte…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={[StyleSheet.absoluteFill, styles.center]}>
              <ActivityIndicator size="large" color={Colors.orange} />
            </View>
          )}
          // Allow loading external resources (Leaflet CDN)
          mixedContentMode="always"
          allowsInlineMediaPlayback
          originWhitelist={['*']}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  headerTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  webView: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.red,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
