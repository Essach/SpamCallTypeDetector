# Migracja: BroadcastReceiver -> CallScreeningService

Stara architektura (IncomingCallReceiver + IncomingCallHeadlessTaskService)
NIE MOZE dzialac, gdy appka jest calkowicie zamknieta - to twardy limit
systemowy Androida 12+, nie da sie tego obejsc.

CallScreeningService to oficjalne API dokladnie do tego celu (uzywane np.
przez Truecaller) - system SAM binduje ten serwis i uruchamia go dla
kazdego przychodzacego polaczenia, niezaleznie od tego czy appka byla
otwarta. Dlatego omija ograniczenia, na ktore trafilismy.

## Krok 1 - Usun stare pliki (juz niepotrzebne)

Mozesz zostawic pliki na dysku (nie zaszkodzi), ale WYCZYSC z nich wpisy
w AndroidManifest.xml, zeby uniknac crashy przy starym broadcastcie PHONE_STATE:

W android/app/src/main/AndroidManifest.xml USUN calkowicie te dwa bloki:

    <service
        android:name=".IncomingCallHeadlessTaskService"
        android:exported="false" />

    <receiver
        android:name=".IncomingCallReceiver"
        android:exported="true"
        android:permission="android.permission.READ_PHONE_STATE">
        <intent-filter>
            <action android:name="android.intent.action.PHONE_STATE" />
        </intent-filter>
    </receiver>

## Krok 2 - Dodaj nowy serwis w AndroidManifest.xml

W tym samym miejscu (wewnatrz <application>, przed </application>) dodaj:

    <service
        android:name=".CallScreeningServiceImpl"
        android:permission="android.permission.BIND_SCREENING_SERVICE"
        android:exported="true">
        <intent-filter>
            <action android:name="android.telecom.CallScreeningService" />
        </intent-filter>
    </service>

## Krok 3 - Skopiuj nowe pliki Kotlin

Do android/app/src/main/java/com/adrian/odebractelefon/ wrzuc:
- CallScreeningServiceImpl.kt   (USTAW TAM SWOJ PRAWDZIWY BASE_URL na gorze pliku!)
- RoleManagerModule.kt
- RoleManagerPackage.kt

Mozesz (opcjonalnie) usunac stare:
- IncomingCallReceiver.kt
- IncomingCallHeadlessTaskService.kt
(nie sa juz uzywane, ale ich pozostawienie nie zaszkodzi - dopoki manifest
ich nie referencuje, kompilator je zignoruje)

## Krok 4 - Zarejestruj RoleManagerPackage w MainApplication

Otworz android/app/src/main/java/com/adrian/odebractelefon/MainApplication.kt

Znajdz metode getPackages() - wyglada mniej wiecej tak:

    override fun getPackages(): List<ReactPackage> {
      val packages = PackageList(this).packages
      // packages.add(MyReactNativePackage())
      return packages
    }

Zmien na:

    override fun getPackages(): List<ReactPackage> {
      val packages = PackageList(this).packages.toMutableList()
      packages.add(RoleManagerPackage())
      return packages
    }

## Krok 5 - Dodaj zaleznosc OkHttp

W android/app/build.gradle, w sekcji dependencies { ... }, dodaj:

    implementation("com.squareup.okhttp3:okhttp:4.11.0")

## Krok 6 - Usun stare uprawnienia zwiazane z broadcastem (opcjonalnie)

W app.json mozesz usunac READ_PHONE_STATE i READ_CALL_LOG z listy "permissions"
- CallScreeningService NIE wymaga tych uprawnien (dostaje numer bezposrednio
od systemu telefonii). Zostaw tylko:

    "permissions": [
      "POST_NOTIFICATIONS",
      "READ_CALL_LOG"
    ]

(READ_CALL_LOG bywa nadal wymagany przez sam mechanizm roli CALL_SCREENING
na niektorych wersjach Androida - zostaw dla bezpieczenstwa)

## Krok 7 - Dodaj przycisk proszacy o role (patrz App_js_dopisz.txt)

## Krok 8 - Rebuild

    cd android
    ./gradlew clean
    cd ..
    npx expo run:android

## Krok 9 - Nadaj role RECZNIE w appce

1. Otworz appke na emulatorze/telefonie
2. Kliknij przycisk "Ustaw jako aplikacje do wykrywania spamu"
3. System pokaze okienko - wybierz Twoja appke jako domyslna
   (UWAGA: to zdejmie ta role z obecnej domyslnej appki, np. Telefon Google/Samsung
   - mozesz to zmienic z powrotem pozniej w Ustawieniach -> Aplikacje domyslne
   -> Identyfikacja dzwoniacego i spam)

## Krok 10 - Test

1. Zamknij appke calkowicie (swipe z listy ostatnich)
2. Symulacja polaczenia: Extended Controls -> Phone -> Call Device
3. Powinno pojawic sie Twoje powiadomienie z wynikiem analizy

Logi do podgladu:

    adb logcat -s CallScreening:V AndroidRuntime:E

## Rozne wazne uwagi

- Tylko JEDNA appka na raz moze miec te role - jesli masz Truecaller albo
  podobna appke, przelaczy sie na Twoja (i odwrotnie, jesli chcesz wrocic).
- To dziala TYLKO na Android 10+ (API 29+).
- Fetch w Kotlinie (OkHttp) dziala niezaleznie od tego czy JS/Metro dziala -
  to czysto natywny kod, wiec powinno byc bardziej niezawodne niz poprzednia
  wersja przez Headless JS Task.
- Powiadomienie pojawi sie asynchronicznie, PO odpowiedzi z backendu - jesli
  Twoj Vercel akurat "budzi sie" z uspienia (cold start), moze to potrwac
  kilka-kilkanascie sekund.
