import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";
import * as MediaLibrary from "expo-media-library"; // For file permissions on Android
import { Platform } from "react-native";
import { Asset } from "expo-asset";

export const generateReciept = async (receiptData) => {
  const {
    date,
    productDetails,
    customer,
    shopOwner,
    saleType,
    totalAmount,
    paymentMethod,
    paymentStatus,
    amountOwed,
  } = receiptData;

  // Load the logo asset
  const logoAsset = Asset.fromModule(require("../assets/images/logo.png"));
  await logoAsset.downloadAsync();
  const logoBase64 = await FileSystem.readAsStringAsync(logoAsset.localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const productListHTML = productDetails
    .map(
      (product) => `
    <tr>
      <td>${product.name}</td>
      <td>${product.quantity}</td>
      <td>₹${product.price}</td>
      <td>${product.discount ? product.discount + "%" : "N/A"}</td>
      <td>${product.tax ? product.tax + "%" : "N/A"}</td>
      <td>₹${
        product.quantity * product.price -
        (product.quantity * product.price * product.discount) / 100
      }</td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
    <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 700px;
          margin: 50px auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e3e3e3;
        }
        h1 {
          text-align: center;
          color: #007bff;
          margin-bottom: 20px;
          font-size: 26px;
          font-weight: bold;
        }
        h3 {
          color: #333;
          margin-top: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
          font-size: 18px;
        }
        p {
          line-height: 1.8;
          font-size: 16px;
          color: #666;
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 30px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px 15px;
          font-size: 14px;
          text-align: left;
        }
        th {
          background-color: #007bff;
          color: #ffffff;
          text-transform: uppercase;
        }
        .total {
          font-weight: bold;
          font-size: 18px;
          color: #d9534f;
          text-align: right;
          margin-top:   10px;
        }
        .footer {
          margin-top: 10px;
          font-size: 0.85em;
          text-align: center;
          color: #999;
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo img {
          width: 160px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="data:image/png;base64,${logoBase64}" alt="Company Logo" />
        </div>
        <h1>Receipt</h1>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${customer.name}</p>
        <p><strong>Mobile:</strong> ${customer.mobile}</p>
        <p><strong>Address:</strong> ${customer.address.street}, ${
    customer.address.city
  }, 
        ${customer.address.state}, ${customer.address.postalCode}, ${
    customer.address.country
  }</p>
        
        <h3>Shop Information</h3>
        <p><strong>Shop Owner:</strong> ${shopOwner.name}</p>
        <p><strong>Shop Address:</strong> ${
          shopOwner.shopLocation.address.street
        }, ${shopOwner.shopLocation.address.city}, 
        ${shopOwner.shopLocation.address.state}, ${
    shopOwner.shopLocation.address.postalCode
  }</p>
        
        <h3>Sale Details</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Tax</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${productListHTML}
          </tbody>
        </table>
        
        <p class="total"><strong>Total Amount:</strong> ₹${totalAmount}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Payment Status:</strong> ${paymentStatus}</p>
        
        ${
          amountOwed > 0
            ? `<p class="total"><strong>Amount Owed:</strong> ₹${amountOwed}</p>`
            : ""
        }
      </div>
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>If you have any questions, contact us at: support@yourshop.com | Phone: +91-9876543210</p>
      </div>
    </body>
    </html>
  `;

  try {
    // Create the PDF
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    console.log("PDF generated at:", uri);

    // Move the PDF to a permanent location
    const pdfPath = `${FileSystem.documentDirectory}receipt.pdf`;
    await FileSystem.moveAsync({
      from: uri,
      to: pdfPath,
    });

    if (Platform.OS === "ios") {
      // For iOS, use shareAsync which can open the file directly in a viewer
      await shareAsync(pdfPath, { mimeType: "application/pdf" });
    } else if (Platform.OS === "android") {
      // Request file permissions for Android
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access media library is required");
        return;
      }

      // Get a content URI for the PDF (for Android API 24+)
      const contentUri = await FileSystem.getContentUriAsync(pdfPath);

      // Open the PDF using the content URI
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        type: "application/pdf",
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      });
    }
  } catch (error) {
    console.error("Error generating or opening PDF:", error);
  }
};
