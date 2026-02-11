/**
 * ============================================================================
 * config.js - Globale Konfiguration für Pauker-Tool
 * ============================================================================
 * 
 * ZWECK:
 * Diese Datei enthält die globale Konfiguration für die Pauker-Tool-Anwendung.
 * 
 * WICHTIGE HINWEISE FÜR ENTWICKLER:
 * ----------------------------------
 * 
 * 1. LOKALER MODUS:
 *    - Die Anwendung nutzt ausschließlich den lokalen 'database'-Ordner
 *    - Keine externe API-Verbindung erforderlich
 *    - Alle Daten werden aus app_index.js geladen
 * 
 * 2. SETUP FÜR LOKALE ENTWICKLUNG:
 *    - Führe 'node tools/update_index.js' aus, um app_index.js zu aktualisieren
 *    - Öffne index.html in einem Browser oder starte einen lokalen Server
 * 
 * 3. DEPLOYMENT AUF GITHUB PAGES:
 *    - Pushe alle Änderungen in das Repository
 *    - GitHub Pages hostet automatisch die Dateien
 *    - Der Index wird bei Bedarf über die GitHub API aktualisiert
 * 
 * VERWENDUNG IM CODE:
 * -------------------
 * Der Config wird an verschiedenen Stellen verwendet:
 * - index.html: Für die SPA-Version
 * - index.js: Für die Hauptlogik
 * 
 * ZUGRIFF AUF DIE KONFIGURATION:
 * ------------------------------
 * Im JavaScript-Code kann auf die Konfiguration zugegriffen werden:
 *   const mode = window.AppConfig.mode;
 * 
 * ============================================================================
 */

/**
 * Globales Konfigurationsobjekt
 * @type {Object}
 * @property {string} mode - Betriebsmodus der Anwendung
 */
window.AppConfig = {
    /**
     * Betriebsmodus: 'local' für lokale Datenbank
     */
    mode: 'local',

    /**
     * Anwendungsname
     */
    appName: 'Pauker-Tool',

    /**
     * Version
     */
    version: '2.0.0'
};
