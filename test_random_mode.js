// Quick test to verify random mode button functionality
console.log('🎲 Testing Random Mode Button...');

// Test mode switching
try {
    // Check if elements exist
    const randomModeBtn = document.querySelector('[data-mode="random"]');
    const playerSelect = document.querySelector('.player-select');
    const randomStartBtn = document.getElementById('random-start-btn');
    const vsBattleBtn = document.getElementById('vs-battle-btn');
    
    console.log('Elements found:');
    console.log('- Random mode button:', randomModeBtn ? '✅' : '❌');
    console.log('- Player select container:', playerSelect ? '✅' : '❌');
    console.log('- Random start button:', randomStartBtn ? '✅' : '❌');
    console.log('- VS battle button:', vsBattleBtn ? '✅' : '❌');
    
    if (randomModeBtn && playerSelect && randomStartBtn && vsBattleBtn) {
        console.log('✅ All required elements found!');
        
        // Test initial state
        console.log('Initial state:');
        console.log('- Player select has random-mode class:', playerSelect.classList.contains('random-mode') ? '✅' : '❌');
        console.log('- Random start button display:', window.getComputedStyle(randomStartBtn).display);
        console.log('- VS battle button display:', window.getComputedStyle(vsBattleBtn).display);
        
        // Test clicking random mode button
        randomModeBtn.addEventListener('click', () => {
            setTimeout(() => {
                console.log('After clicking random mode:');
                console.log('- Player select has random-mode class:', playerSelect.classList.contains('random-mode') ? '✅' : '❌');
                console.log('- Random start button display:', window.getComputedStyle(randomStartBtn).display);
                console.log('- VS battle button display:', window.getComputedStyle(vsBattleBtn).display);
            }, 100);
        });
        
    } else {
        console.log('❌ Some elements are missing');
    }
    
} catch (error) {
    console.log('❌ Error during testing:', error);
}

console.log('🎯 Test script loaded. Click the random mode button to test functionality.');