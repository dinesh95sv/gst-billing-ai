# Smart Yedu 📱🧾

A powerful, cross-platform mobile application for GST billing and invoicing, built with React Native, Expo, and NativeWind.

## 🚀 Features

*   **Cross-Platform:** Runs on Android, iOS, and Web.
*   **GST Invoicing:** Create, edit, and manage GST-compliant invoices.
*   **PDF Generation:** Instantly generate professional PDF invoices and reports.
*   **Data Persistence:** Offline-first architecture using AsyncStorage.
*   **Modern UI:** Beautiful, responsive interface styled with NativeWind (Tailwind CSS).
*   **Digital Signatures:** Integrated signature pad for authorized signing.
*   **Reports:** Track monthly sales, tax liabilities, and growth metrics.

## 🛠️ Tech Stack

*   **Framework:** [Expo SDK 52](https://expo.dev) (React Native)
*   **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
*   **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native)
*   **Icons:** [Lucide React Native](https://lucide.dev/)
*   **Storage:** `@react-native-async-storage/async-storage`
*   **PDF:** `expo-print` & `expo-sharing`
*   **Graphics:** `react-native-svg`

---

## 🏁 Setup Instructions

Follow these steps to set up the project locally.

### Prerequisites

*   **Node.js** (LTS version recommended)
*   **npm** or **yarn**
*   **Expo Go** app installed on your physical mobile device (Android/iOS) OR an Emulator (Android Studio / Xcode).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd gst-billing-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Note: This project uses native dependencies. If prompted to fix peer dependencies, use `npm install --legacy-peer-deps`.*

### Running the App

*   **Start the Development Server:**
    ```bash
    npx expo start
    ```

*   **Run on Web:**
    ```bash
    npm run web
    # or
    npx expo start --web
    ```

*   **Run on Android/iOS:**
    *   Scan the QR code displayed in the terminal using the **Expo Go** app on your phone.
    *   Or press `a` to open in Android Emulator, `i` to open in iOS Simulator.

---

## 📱 Pages & Architecture

The application uses **Expo Router**, so the file structure in `app/` directly maps to the navigation routes.

### 1. Dashboard (`/`)
*   **Overview:** The landing page providing a quick snapshot of business health.
*   **Features:** Monthly sales stats, pending invoice count, recent activity feed, and quick actions.

### 2. Invoices (`/invoices`)
*   **Route:** `app/invoices.tsx` -> `components/Invoices.tsx`
*   **Features:** Comprehensive list of all generated invoices. Supports searching, filtering by status (Paid, Pending, Overdue), and deleting invoices.

### 3. Invoice Creation & Editing (`/create-invoice`, `/edit-invoice/[id]`)
*   **Route:** `app/create-invoice.tsx`, `app/edit-invoice/[id].tsx` -> `components/InvoiceForm.tsx`
*   **Features:** Dynamic form to add customer details, multiple product line items, tax calculations (IGST/CGST/SGST), and toggle between "Edit" and "Create" modes.

### 4. Product Management (`/products`)
*   **Route:** `app/products.tsx` -> `components/Products.tsx`
*   **Features:** Manage your inventory. Add, edit, or delete products with details like HSN code, tax rate, and unit price.

### 5. Customer Management (`/customers`)
*   **Route:** `app/customers.tsx` -> `components/Customers.tsx`
*   **Features:** Directory of clients. Store GSTIN, address, and contact details for quick auto-filling during invoicing.

### 6. Factory/Unit Management (`/factories`)
*   **Route:** `app/factories.tsx` -> `components/Factories.tsx`
*   **Features:** Manage multiple business units or branches. Select distinct factory details (address, bank info) for different invoices.

### 7. Reports (`/reports`, `/report-preview`)
*   **Components:** `components/GstReport.tsx`, `components/GstReportPreview.tsx`
*   **Features:** Visual charts (Bar Charts) for sales trends. Generates a strict "GST Liability Report" calculating Input/Output tax credits. Includes PDF export.

### 8. Utilities
*   **Signature Pad:** (`components/SignaturePad.tsx`) - Capture authorized signatures for documents.
*   **Invoice Preview:** (`components/InvoicePreview.tsx`) - WYSIWYG preview of the final invoice PDF before sharing.

## 📂 Project Structure

```
gst-billing-ai/
├── app/                    # Expo Router pages (routes)
│   ├── index.tsx           # Home/Dashboard route
│   ├── _layout.tsx         # Global layout & providers
│   ├── invoices.tsx        # Invoices route
│   └── ...                 # Other routes
├── components/             # Reusable React components
│   ├── Dashboard.tsx       # Dashboard UI logic
│   ├── InvoiceForm.tsx     # Complex form logic
│   └── ...                 # UI Components
├── services/               # Logic layer
│   └── storage.ts          # Async Storage Wrapper (DB)
├── types/                  # TypeScript definitions
├── global.css              # Tailwind directives
├── tailwind.config.js      # NativeWind configuration
└── babel.config.js         # Babel setup
```

## ⚠️ Notes

*   **Web Styling:** If running on web, ensure the NativeWind babel plugin is correctly configured. If you encounter build errors on web specifically, check `babel.config.js`.
*   **PDF Generation:** Uses `expo-print`. On web, this triggers the browser's print dialog. On mobile, it generates a true PDF file.
