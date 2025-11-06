'use client';

import { useEffect, useState } from 'react';

/**
 * Google Maps Functionality Test Page
 * Tests: (1) All places shown by default (2) Apartment locations verified
 */
export default function MapTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      try {
        const response = await fetch('/api/properties');
        const data = await response.json();
        const properties = data.properties || [];

        // Expected range for Philadelphia University City area
        const EXPECTED_LAT_MIN = 39.94;
        const EXPECTED_LAT_MAX = 39.96;
        const EXPECTED_LNG_MIN = -75.22;
        const EXPECTED_LNG_MAX = -75.15;

        const invalidProperties: any[] = [];
        const validProperties: any[] = [];

        properties.forEach((prop: any) => {
          const { name, latitude, longitude, address } = prop;

          // Check if coordinates exist
          if (!latitude || !longitude) {
            invalidProperties.push({
              name,
              address,
              reason: 'Missing coordinates',
            });
            return;
          }

          // Check if coordinates are valid numbers
          if (isNaN(latitude) || isNaN(longitude)) {
            invalidProperties.push({
              name,
              address,
              reason: 'Invalid coordinate format',
              coordinates: { lat: latitude, lng: longitude },
            });
            return;
          }

          // Check if coordinates are in expected range
          if (
            latitude < EXPECTED_LAT_MIN ||
            latitude > EXPECTED_LAT_MAX ||
            longitude < EXPECTED_LNG_MIN ||
            longitude > EXPECTED_LNG_MAX
          ) {
            invalidProperties.push({
              name,
              address,
              reason: 'Coordinates outside expected range',
              coordinates: { lat: latitude, lng: longitude },
              expectedRange: {
                lat: [EXPECTED_LAT_MIN, EXPECTED_LAT_MAX],
                lng: [EXPECTED_LNG_MIN, EXPECTED_LNG_MAX],
              },
            });
            return;
          }

          validProperties.push({
            name,
            address,
            coordinates: { lat: latitude, lng: longitude },
            price: prop.price,
            walkingDistance: prop.walkingDistanceToWharton,
          });
        });

        // Calculate average center
        const avgLat =
          properties.reduce((sum: number, p: any) => sum + (p.latitude || 0), 0) /
          properties.length;
        const avgLng =
          properties.reduce((sum: number, p: any) => sum + (p.longitude || 0), 0) /
          properties.length;

        setTestResults({
          totalProperties: properties.length,
          validProperties: validProperties.length,
          invalidProperties: invalidProperties.length,
          invalidDetails: invalidProperties,
          validDetails: validProperties,
          averageCenter: { lat: avgLat, lng: avgLng },
          allTestsPassed:
            properties.length > 0 &&
            invalidProperties.length === 0 &&
            validProperties.length === properties.length,
        });
      } catch (error: any) {
        setTestResults({
          error: error.message,
          allTestsPassed: false,
        });
      } finally {
        setLoading(false);
      }
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="text-2xl mb-4">🧪</div>
          <p className="text-stone-600">Running tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-900 mb-8">
          🧪 Google Maps Functionality Test
        </h1>

        {testResults?.error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">❌ Test Error</h2>
            <p className="text-red-600">{testResults.error}</p>
          </div>
        ) : (
          <>
            {/* Test Summary */}
            <div
              className={`rounded-xl p-6 mb-6 ${
                testResults?.allTestsPassed
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4">📋 Test Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-stone-600 mb-1">Total Properties</div>
                  <div className="text-2xl font-bold">{testResults?.totalProperties}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">Valid Locations</div>
                  <div className="text-2xl font-bold text-green-600">
                    {testResults?.validProperties}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-stone-600 mb-1">Invalid Locations</div>
                  <div className="text-2xl font-bold text-red-600">
                    {testResults?.invalidProperties}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-200">
                <div className="text-lg font-semibold">
                  {testResults?.allTestsPassed ? (
                    <span className="text-green-700">✅ ALL TESTS PASSED</span>
                  ) : (
                    <span className="text-yellow-700">⚠️ SOME ISSUES FOUND</span>
                  )}
                </div>
              </div>
            </div>

            {/* Test 1: All places shown by default */}
            <div className="bg-white rounded-xl p-6 mb-6 border border-stone-200">
              <h2 className="text-xl font-semibold mb-4">Test 1: All Places Shown by Default</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {testResults?.totalProperties > 0 ? (
                    <>
                      <span className="text-green-600">✅</span>
                      <span>
                        {testResults.totalProperties} properties loaded successfully
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-600">❌</span>
                      <span>No properties loaded</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {testResults?.validProperties === testResults?.totalProperties ? (
                    <>
                      <span className="text-green-600">✅</span>
                      <span>
                        All {testResults.validProperties} properties have valid coordinates
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-yellow-600">⚠️</span>
                      <span>
                        Only {testResults?.validProperties} out of {testResults?.totalProperties}{' '}
                        properties have valid coordinates
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">ℹ️</span>
                  <span>
                    Map should display all {testResults?.validProperties} valid properties by default
                  </span>
                </div>
              </div>
            </div>

            {/* Test 2: Location Verification */}
            <div className="bg-white rounded-xl p-6 mb-6 border border-stone-200">
              <h2 className="text-xl font-semibold mb-4">
                Test 2: Apartment Location Verification
              </h2>
              <div className="mb-4">
                <div className="text-sm text-stone-600 mb-2">Expected Range (Philadelphia University City):</div>
                <div className="text-sm font-mono bg-stone-100 p-2 rounded">
                  Latitude: 39.94 - 39.96
                  <br />
                  Longitude: -75.22 - -75.15
                </div>
              </div>

              {testResults?.invalidDetails && testResults.invalidDetails.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-red-700 mb-2">
                    ❌ Properties with Invalid Locations ({testResults.invalidDetails.length}):
                  </h3>
                  <div className="space-y-2">
                    {testResults.invalidDetails.map((prop: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-red-50 border border-red-200 rounded p-3 text-sm"
                      >
                        <div className="font-semibold">{prop.name}</div>
                        <div className="text-stone-600">{prop.address}</div>
                        <div className="text-red-600">Issue: {prop.reason}</div>
                        {prop.coordinates && (
                          <div className="text-stone-500">
                            Coordinates: {prop.coordinates.lat}, {prop.coordinates.lng}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-green-700 mb-2">
                  ✅ Valid Properties ({testResults?.validDetails?.length || 0}):
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {testResults?.validDetails?.map((prop: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-green-50 border border-green-200 rounded p-3 text-sm"
                    >
                      <div className="font-semibold">{prop.name}</div>
                      <div className="text-stone-600">{prop.address}</div>
                      <div className="text-stone-500 font-mono">
                        {prop.coordinates.lat.toFixed(6)}, {prop.coordinates.lng.toFixed(6)}
                      </div>
                      <div className="text-stone-500">
                        Price: ${prop.price}/person | Walk: {prop.walkingDistance || 'N/A'} min
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Center Info */}
            <div className="bg-white rounded-xl p-6 border border-stone-200">
              <h2 className="text-xl font-semibold mb-4">Map Center Calculation</h2>
              <div className="text-sm">
                <div className="mb-2">
                  <span className="font-semibold">Calculated Average Center:</span>
                </div>
                <div className="font-mono bg-stone-100 p-2 rounded mb-2">
                  {testResults?.averageCenter?.lat.toFixed(6)},{' '}
                  {testResults?.averageCenter?.lng.toFixed(6)}
                </div>
                <div className="text-stone-600">
                  Expected (Wharton School): 39.954600, -75.196000
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

