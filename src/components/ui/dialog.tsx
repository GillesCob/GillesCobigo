import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// Marge visible (fond assombri) autour de la modale, entre son bord et la barre du haut / le
// clavier virtuel, cf sync visualViewport ci-dessous.
const DIALOG_VIEWPORT_MARGIN_PX = 48

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, style, ...props }, ref) => {
  // Modale sous le clavier sur mobile (19/08, retour testeur iOS, Boutiques PricingCard) :
  // `top-[50%]` + `translate-y-[-50%]` centrent la modale sur le *layout* viewport, qui ne
  // retrecit pas quand le clavier virtuel s'ouvre (seul le *visual* viewport retrecit, cf
  // window.visualViewport, supporte Safari iOS 13+ / Chrome / Firefox mobile). On recalcule le
  // vrai centre visible a l'ouverture et a chaque resize/scroll (apparition/disparition du
  // clavier), pour que toute Dialog de l'app reste centree entre la barre du haut et le clavier,
  // avec une marge visible tout autour. `maxHeight` + `overflow-y-auto` evitent tout debordement
  // hors zone visible si le contenu est plus grand que l'espace disponible. Reproduit le
  // comportement de Projets/V1-Echanges/mockups/preview-prospect.html (mockup de reference du
  // funnel Boutiques). Fallback silencieux sur le centrage CSS classique si l'API est absente.
  const [viewport, setViewport] = React.useState<{ top: number; height: number } | null>(null)

  React.useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    function sync() {
      setViewport({ top: vv!.offsetTop, height: vv!.height })
    }
    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
    }
  }, [])

  const viewportStyle: React.CSSProperties | undefined = viewport
    ? { top: viewport.top + viewport.height / 2, maxHeight: viewport.height - DIALOG_VIEWPORT_MARGIN_PX }
    : undefined

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        style={{ ...viewportStyle, ...style }}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          className,
        )}
        {...props}
      >
        {children}
        {/* p-3 (19/08, item 24) : l'icone seule (16x16) etait sous le minimum recommande de 44px
            (Apple HIG) pour un tap fiable sur mobile, contributeur probable au "la croix ne
            fonctionne pas" remonte par le testeur, en plus du desynchro fixed-position/clavier
            deja corrige par le fix visualViewport ci-dessus. right-2/top-2 compensent le padding
            ajoute pour garder l'icone visuellement au meme endroit. */}
        <DialogClose className="absolute right-2 top-2 rounded-sm p-3 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
