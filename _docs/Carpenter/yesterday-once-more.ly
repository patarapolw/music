\version "2.22.1"
\language "english"

\header {
  title = "Yesterday Once More"
  composer = "The Carpenters (1973)"
}

\score {
  <<
  \new ChordNames \with {midiInstrument = "acoustic guitar (nylon)"} {
    \chordmode {
      r1
      c e:m a:m a:m/g
      f e:m7 d:m7

      c e:m a2:m a:m/g
      f b4:m5-7 e:7
      a1:m a:m/g f2 d:m7 g2:7 f4 g
      
      c1 a:m e:m7
      c1 a:m g:7
      a:m a:m/g
      c' f d:m7 g c
    }
  }
  
  \new Voice = "one" \relative ef' {
    \tempo 4 = 128
    \key c \major
    \clef 	treble
    r2 r8 c8 c d
    e4 g g8 e g e
    a g4 e4. e8 g
    a4 b4 e,8 g4 a8~

    a2 r4 e8 g
    a4 e' d8 c4 b8~
    b4. g8 e g4 e8(
    d2) r8 c8( c) d
    
    e4 g8 e g e g e
    a g4 e4. e8 g
    a4 b4 e,8 g4 a8~
    
    a2 b4 d
    c8 b4 b b8 c b
    c b4 a4. a8 b
    c4 c a8 c4 d8~

    d2 c4 d
    e8 e e e~ e4 d8 c
    b c b a~ a4 e8 g~
    g2 c4 d
    e8 e e e e4 d8 c
    b c b a~ a4 e8 g~
    g2 r4 d8 e
    f e f g~ g4 f8 e
    f e f g~ g4 f8 g
    a4 a g8 f~ f d8~
    d4 a4 a d8~( a)
    c2. r8 a8
    a g16 e8. g8 a2~
    a1 \bar "||"
  }
  
  \new Lyrics \lyricsto "one" {
    When I was young, I'd list -- ened to the ra -- di -- o,
    wait -- ing for my fav -- orite songs.
    When they played, I'd sing a -- long. it makes me smile.
    
    Those was such hap -- py time, but not so long a -- go,
    how I won -- dered where they'd gone.
    But they're back a -- gain, just like a long lost friend.
    All the songs I loved so well.
    
    Eve -- ry sha la la la
    Eve -- ry wo o wo o still shines.
    Eve -- ry shing a ring a ring
    that they're start -- in' to sing so fine.
    
    When they get to the part
    Where he's break -- in' her heart
    It can rea -- lly make me cry
    just like be -- fore.
    It's yes -- ter -- day once more.
  }
  >>

  \layout {}
  \midi {}
}