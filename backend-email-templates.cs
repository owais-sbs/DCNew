// Copy these methods into your backend Email controller/service.
// - Logo: single-line tag, 140px max, double-quoted attributes (avoids broken rendering).
// - Attachment: single-line <a> tag; ensure email is sent as Content-Type: text/html.
// - If your backend sends the body through something that HTML-encodes it, send as HTML body, not plain text.

private string BuildWithoutAttachment(string message)
{
    return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
</head>
<body style=""margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
        <tr>
            <td align=""center"" style=""padding:30px 0;"">
                <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.08);"">
                    <tr>
                        <td align=""center"" style=""padding:16px 20px;"">
                            <img src=""https://app.dcedu.ie/src/assets/logo.png"" alt=""DCE English Language School"" width=""140"" height=""auto"" style=""max-width:140px;width:140px;height:auto;display:block;"" />
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding:30px;color:#333;font-size:14px;line-height:1.6;"">
                            {message}
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding:20px;text-align:center;font-size:12px;color:#777;border-top:1px solid #eee;"">
                            <strong>DCE English Language School</strong><br/>
                            This is an automated message. Please do not reply.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
}

private string BuildWithAttachment(string message, string attachmentUrl)
{
    // Single-line tags avoid email clients showing attribute text as body (no newlines inside <img> or <a>).
    string attachmentBlock = string.IsNullOrWhiteSpace(attachmentUrl)
        ? ""
        : $@"
<tr>
<td style=""padding:20px 25px;background:#f9fafb;border-top:1px solid #eee;"">
    <p style=""margin:0 0 12px 0;font-size:13px;color:#555;"">
        📎 Attached document – download via the link below.
    </p>
    <a href=""{attachmentUrl.Replace("\"", "&quot;")}"" target=""_blank"" rel=""noopener noreferrer"" style=""display:inline-block;padding:10px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:4px;font-size:13px;"">Download file</a>
</td>
</tr>";

    return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
</head>
<body style=""margin:0;padding:0;background-color:#f5f7fa;font-family:Arial,sans-serif;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
        <tr>
            <td align=""center"" style=""padding:20px;"">
                <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:6px;border:1px solid #e5e7eb;"">
                    <tr>
                        <td align=""center"" style=""padding:16px 20px;"">
                            <img src=""https://app.dcedu.ie/src/assets/logo.png"" alt=""DCE English Language School"" width=""140"" height=""auto"" style=""max-width:140px;width:140px;height:auto;display:block;"" />
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding:25px;color:#333;font-size:14px;line-height:1.6;"">
                            {message}
                        </td>
                    </tr>
                    {attachmentBlock}
                    <tr>
                        <td style=""padding:15px;text-align:center;font-size:12px;color:#777;border-top:1px solid #eee;"">
                            <strong>DCE English Language School</strong><br/>
                            This is an automated message. Please do not reply.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
}

// Warning email (First/Second/Third/Final Warning, Expulsion). Use single-line img; double-quoted attributes.
private string BuildWarningEmailHtml(string studentName, string title, string message, string severityColor)
{
    string safeColor = severityColor?.Replace("\"", "") ?? "#b91c1c";
    return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
</head>
<body style=""margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
        <tr>
            <td align=""center"" style=""padding:24px 0;"">
                <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid #e5e7eb;"">
                    <tr>
                        <td align=""center"" style=""padding:20px 24px;"">
                            <img src=""https://app.dcedu.ie/src/assets/logo.png"" alt=""DCE English Language School"" width=""140"" height=""auto"" style=""max-width:140px;width:140px;height:auto;display:block;"" />
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding:8px 24px 20px;text-align:center;"">
                            <h2 style=""margin:0;font-size:18px;font-weight:600;color:{safeColor};"">{title}</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding:0 24px 28px;color:#374151;font-size:14px;line-height:1.65;"">
                            <p style=""margin:0 0 16px 0;"">Dear <strong>{studentName}</strong>,</p>
                            <p style=""margin:0 0 16px 0;"">{message}</p>
                            <p style=""margin:0 0 24px 0;color:#6b7280;"">Please take this matter seriously and contact the administration if you have any questions or concerns.</p>
                            <p style=""margin:0;"">Regards,<br/><strong>DCE English Language School</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding:16px 24px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;"">
                            This is an automated warning email. Please do not reply.<br/>© {DateTime.UtcNow.Year} DCE English Language School
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
}
