\version "2.22.1"

\header {
  title = "My Heart Will Go On"
  composer = "Theme from Titanic (1997)"
  tagline = \markup {
    Engraved at
    \simple #(strftime "%Y-%m-%d" (localtime (current-time)))
    with \with-url #"http://lilypond.org/"
    \line { LilyPond \simple #(lilypond-version) (http://lilypond.org/) }
  }
}

vocal = <<
\new ChordNames \with {midiInstrument = "acoustic guitar (nylon)"} {
  \set chordChanges = ##t
  \chordmode {
    \repeat volta 2 {
      e1 b a e2 b
      e1 b a
    }
    \alternative {
      { a1 }
      { a2 gis:m }
    }
    
    cis1:m b a b cis:m b a gis2:m fis:m
    cis1:m b a b cis:m b a b2 a e1 e
    
    \repeat volta 2 {
      e1 b a e2 b
      e1 b a
    }
    \alternative {
      { a1 }
      { a2 gis:m }
    }
    
    cis1:m b a b cis:m b a gis2:m fis:m
    cis1:m b a b cis:m b a b2 a cis1:m b
    
    a b cis:m b a gis2 fis
    
    f1:m ees des ees
    f:m ees des c2:m bes:m
    f1:m ees des ees
    f:m ees des ees2 des
    f1:m ees des des
    f:m ees des des f:m
  }
}

\new Voice = "one" \relative e' {
  \tempo 4 = 120
  \key e \major
  
  \repeat volta 2 {
    e4. e8 e4 e
    dis e2 e4
    dis e2 fis4
    gis2 fis
    e4. e8 e4 e
    dis e2 e4
    b1(
  }
  \alternative {
    { cis1) }
    { cis2 cis4( dis }
  }
  
  \break
  
  e1) fis2. b,4
  b'2 a4 gis8 fis~
  fis2 gis4 a
  gis2 fis4 e
  
  \break
  
  dis e2 dis4
  cis2.~( cis8 dis16 cis
  b2 a2)
  
  \break
  
  e'1 fis2. b,4
  b'2 a4 gis8 fis~
  fis2 gis4 a
  gis2 fis4 e
  
  \break
  
  dis e2 dis4
  dis e2 fis4
  gis2 fis e1~ e
  
  \break
  
  \repeat volta 2 {
    e4. e8 e4 e
    dis e2 e4
    dis e2 fis4
    gis2 fis
    e4. e8 e4 e
    dis e2 e4
    b1~
  }
  \alternative {
    { b1 }
    { cis2 cis4( dis }
  }
  
  \break
  
  e1) fis2. b,4
  b'2 a4 gis8 fis~
  fis2 gis4 a
  gis2 fis4 e
  
  \break
  
  dis e2 dis4
  cis2.~( cis8 dis16 cis
  b2 a2)
  
  \break
  
  e'1 fis2. b,4
  b'2 a4 gis8 fis~
  fis2 gis4 a
  gis2 fis4 e
  
  \break
  
  dis e2 dis4
  dis e2 fis4
  gis2 fis e1~ e1
  
  \break
  
  r r r r
  
  \break
  
  r r
  
  \key aes \major
  
  aes1
  bes2. ees,4
  
  \break
  
  ees'2 des4 c8 bes8~
  bes2 c4 des
  c2 bes4 aes
  g aes2 g4
  
  \break
  
  f2.(~ f8 g16 f
  ees2 des)
  aes'1
  
  \break

  bes2. ees,4
  ees'2 des4 c8 bes8~
  bes2 c4 des
  
  \break

  c2 bes4 aes
  g aes2 g4
  g aes2 bes4
  c2 bes
  
  \break

  aes1 r r r
  
  \break
  
  r r r r r
  
  \bar "|."
}

\new Lyrics \lyricsto "one" {
  <<
  {
    Eve -- ry night in my dreams
    I see you, I feel you.
    That is how I know you, go on.
  }
  
  \new Lyrics {
    \set associatedVoice = "one"
    Far a -- cross the dis -- tance
    And spa -- ces, be -- tween us
    You have come to show you, go on.
    \skip 1
    Near,
  }
  >>

  far, wher -- e -- ver you are
  I be -- lieve that the heart does, go on

  Once more you o -- pen the door,
  and you're here in my heart,
  and my heart will go on, and on.
  
  <<
  {
    Love can touch us one time,
    and last for a life time,
    and ne -- ver let go till we're gone.
  }
  \new Lyrics {
    \set associatedVoice = "one"
    Love was when I loved you
    one true time, I hold to.
    In my life we'll al -- ways, go on.
    \skip 1
    Near,
  }
  >>
  
  far, wher -- e -- ver you are
  I be -- lieve that the heart does, go on.
  Once more you o -- pen the door,
  and you're here in my heart,
  and my heart will go on and on.

  You're here, there's no -- thing I fear,
  and I know that my heart will go on.
  We'll, stay, for -- e -- ver this way.
  You are safe in my heart,
  and my heart will, go on and on
}
>>

\score {
  \transpose e e {
    \vocal
  }

  \layout {}
}

\score {
  \unfoldRepeats {
    \vocal
  }
  \midi {}
}
