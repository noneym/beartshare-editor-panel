-- Create email_templates table for admin panel
CREATE TABLE IF NOT EXISTS email_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some default templates
INSERT INTO email_templates (name, subject, content) VALUES
('Hoş Geldiniz E-postası', 'Merhaba [isim], Beartshare''e Hoş Geldiniz!', '<h2>Merhaba [isim] [soyisim]!</h2><p>Beartshare ailesine katıldığınız için teşekkür ederiz. E-posta adresiniz: [email]</p><p>[metin]</p>'),
('Şifre Sıfırlama', '[isim], şifrenizi sıfırlayın', '<h2>Merhaba [isim]!</h2><p>Şifre sıfırlama talebiniz alındı. [email] adresinize gönderilen bağlantıyı kullanarak şifrenizi sıfırlayabilirsiniz.</p><p>[metin]</p>'),
('Kampanya Duyurusu', 'Özel Kampanya - [metin]', '<h2>Sayın [isim] [soyisim],</h2><p>Sizin için özel bir kampanyamız var! [metin]</p><p>Detaylar için [email] adresinden bize ulaşabilirsiniz.</p>');
