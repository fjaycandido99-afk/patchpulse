import UIKit
import Capacitor
import UserNotifications

// Import OneSignal safely
#if canImport(OneSignalFramework)
import OneSignalFramework
#endif

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // Initialize OneSignal safely
        #if canImport(OneSignalFramework)
        let oneSignalAppId = "06b63fd2-b5f5-4146-9c4e-9d28c58862eb"
        OneSignal.initialize(oneSignalAppId, withLaunchOptions: launchOptions)

        // Request push permission after a delay to not block app launch
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            OneSignal.Notifications.requestPermission({ accepted in
                print("[PatchPulse] OneSignal permission accepted: \(accepted)")
            }, fallbackToSettings: true)
        }
        #endif

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
