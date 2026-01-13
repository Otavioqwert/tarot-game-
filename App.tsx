          <div className="relative py-12">
            <CardCircle 
              slots={slots} 
              onRemove={handleRemoveCard} 
              onPlace={handlePlaceCard} 
              selectedCardIndex={selectedInventoryIndex} 
              onActivate={handleActivateEffect} 
              globalHours={globalHours}
              activeSynergies={activeSynergies}
            />