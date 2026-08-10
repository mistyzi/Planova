# Planova - Your study schedule, astronomically aligned. 

ABOUT WILL GO HERE

## ★ FEATURES !!
- Task Tracker
- Focus Timer
- Background Music Player
- Daily Streak Tracker
- Note Uploading
- Flashcard Creator
- Reference Library
- 

## ★ PROJECT STRUCTURE !!

	PLANOVA/
	├── app/						# All Screens (Expo Router)
	│   ├── _layout.tsx				# Root Layout
	│   ├── index.tsx 				# Home Screen
	│ 
	│   ├── (tabs)/					# Tab Navigation
	│   │ 	├── _layout.tsx			# Tab Layout
	│   │ 	├── index.tsx			# Home Tab
	│   │ 	├── tasks.tsx			# Tasks Tab
	│   │ 	└── study.tsx			# Study Tab
	│
	│   ├── bookmarkMaker.tsx		# Bookmark Maker
	│   ├── bookmarks.tsx			# Bookmark List
	│
	│   ├── note.tsx				# Note Editor
	│   ├── notes.tsx				# Notes List
	│   
	│   ├── flashcards.tsx 			# Flashcard List
	│   ├── flashcardMaker.tsx		# Flashcard Maker
	│
	│   ├── focusSession.tsx		# Timer Session
	│   ├── focusTimer.tsx			# Timer Setter
	│
	│   ├── studyGuides.tsx			# Study Guide List
	│   ├── studyGuideMaker.tsx		# Study Guide Maker
	│   ├── studyGuide.tsx			# Study Guide
	│  
	│   ├── referenceLibrary.tsx	# Stored References
	│   ├── referenceMaker.tsx		# Reference Maker
	│
	│  	└── ocr.ts					# OCR Scanning Logic
	│
	├── assets/   
	│   ├── icon.png				# Mobile App Icon
	│   ├── fonts/					# Custom Fonts
	│   └── music/					# Audio Files
	│ 
	├── components/     			# Reusable UI Components  
	│   ├── focusTimerOverlay.tsx
	│   ├── header.tsx
	│   ├── musicselector.tsx
	│   ├── profilesheet.tsx
	│   └── starrybackground.tsx
	│ 
	├── context/					# Global State (React Context)
	│	├── focustimercontext.tsx
	│	├── profilesheetcontext.tsx
	│   └── themecontext.tsx
	│
	├── storage/    TO DO
	│
	├── utils/   					# Secure OCR Key Loader
	│   └── ocr.ts
	│
	├── app.config.ts       
	├── package.json    
	└── tsconfig.json 
