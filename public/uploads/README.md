# This directory is used for local development file uploads.
# Files in /public/uploads are served statically by Next.js.
#
# Structure:
#   /public/uploads/videos/       — course video lecture uploads (.mp4, .webm)
#   /public/uploads/documents/    — PDF, PPTX, DOCX uploads
#   /public/uploads/images/       — avatar and thumbnail image uploads
#
# IMPORTANT: Do NOT commit real uploaded files to version control.
# Add /public/uploads/videos/, /public/uploads/documents/, /public/uploads/images/
# to your .gitignore for production deployments.
#
# For production, switch UPLOAD_STORAGE="cloud" in your .env and configure
# a cloud provider (Cloudinary, UploadThing, or AWS S3) in .env.example.
