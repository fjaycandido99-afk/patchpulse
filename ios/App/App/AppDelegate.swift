import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    // Store the device token to inject into web view
    static var deviceToken: String?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Request push notification permission on launch
        requestPushNotificationPermission(application: application)
        return true
    }

    // MARK: - Push Notification Registration

    private func requestPushNotificationPermission(application: UIApplication) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            print("[PatchPulse] Push permission granted: \(granted)")
            if let error = error {
                print("[PatchPulse] Push permission error: \(error.localizedDescription)")
            }

            if granted {
                DispatchQueue.main.async {
                    application.registerForRemoteNotifications()
                }
            }
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Re-check push status when app becomes active
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            if settings.authorizationStatus == .authorized {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // MARK: - Push Notifications

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Convert token to string
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("[PatchPulse] Got device token: \(tokenString.prefix(20))...")

        // Store token
        AppDelegate.deviceToken = tokenString
        UserDefaults.standard.set(tokenString, forKey: "pushDeviceToken")

        // Inject token into web view
        injectDeviceTokenIntoWebView(token: tokenString)

        // Also notify Capacitor (for compatibility)
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[PatchPulse] Failed to register for push: \(error.localizedDescription)")
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    // MARK: - Web View Token Injection

    private func injectDeviceTokenIntoWebView(token: String) {
        // Find the Capacitor web view and inject the token
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            guard let window = self.window,
                  let rootVC = window.rootViewController else {
                print("[PatchPulse] Could not find root view controller")
                return
            }

            // Find the CAPBridgeViewController
            if let bridgeVC = self.findBridgeViewController(from: rootVC) {
                let js = """
                    (function() {
                        window.nativePushToken = '\(token)';
                        localStorage.setItem('nativePushToken', '\(token)');
                        localStorage.setItem('isNativeApp', 'true');
                        console.log('[Native] Injected push token');
                        // Dispatch event so web app can react
                        window.dispatchEvent(new CustomEvent('nativePushTokenReady', { detail: { token: '\(token)' } }));
                    })();
                """
                bridgeVC.webView?.evaluateJavaScript(js) { result, error in
                    if let error = error {
                        print("[PatchPulse] JS injection error: \(error.localizedDescription)")
                    } else {
                        print("[PatchPulse] Token injected into web view")
                    }
                }
            } else {
                print("[PatchPulse] Could not find CAPBridgeViewController")
            }
        }
    }

    private func findBridgeViewController(from vc: UIViewController) -> CAPBridgeViewController? {
        if let bridgeVC = vc as? CAPBridgeViewController {
            return bridgeVC
        }

        for child in vc.children {
            if let found = findBridgeViewController(from: child) {
                return found
            }
        }

        if let presented = vc.presentedViewController {
            return findBridgeViewController(from: presented)
        }

        return nil
    }
}
